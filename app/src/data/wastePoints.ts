import { getDatabase } from '../db/database';
import { supabase } from '../lib/supabase';
import { generateId } from '../lib/uuid';
import { runSync } from '../sync/syncEngine';

export type WasteStatus = 'plein' | 'partiel' | 'vide';

export interface WastePointWithStatus {
  id: string;
  name: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Statut du dernier signalement reçu pour ce point, ou null si jamais signalé. */
  latestStatus: WasteStatus | null;
  latestNote: string | null;
  latestReportAt: string | null;
  /** Nombre de signalements reçus au cours des 7 derniers jours. */
  recentReportCount: number;
  /** Score de priorité — voir computePriorityScore() ci-dessous. */
  priorityScore: number;
  /** Nombre de signalements locaux pas encore synchronisés pour ce point. */
  pendingCount: number;
}

/**
 * Récupère les points de collecte depuis Supabase et les met en cache
 * local (SQLite) pour un accès hors ligne. Best-effort : si le réseau
 * est indisponible, on ne fait rien et l'écran continue avec le cache
 * déjà présent en local (voir getWastePointsWithStatus).
 */
export async function fetchAndCacheWastePoints(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.from('waste_points').select('*');
  if (error || !data) {
    return;
  }

  const db = await getDatabase();
  for (const point of data) {
    await db.runAsync(
      `INSERT OR REPLACE INTO waste_points (id, name, latitude, longitude, neighborhood, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [point.id, point.name, point.latitude, point.longitude, point.neighborhood, point.created_at]
    );
  }
}

const SEVERITY_WEIGHT: Record<WasteStatus, number> = {
  plein: 3,
  partiel: 2,
  vide: 1,
};

/**
 * Score de priorité — tâche n°14.
 *
 * Combine trois signaux, dans cet ordre d'importance :
 *  1. Gravité du dernier statut connu (plein > partiel > vide > jamais signalé).
 *  2. Nombre de signalements dans les 7 derniers jours — un point signalé
 *     plusieurs fois récemment indique un vrai problème récurrent, pas
 *     juste un signalement isolé.
 *  3. Fraîcheur du dernier signalement — à gravité égale, un signalement
 *     très récent (< 48h) passe légèrement devant un signalement ancien.
 *
 * Les poids (×100 / ×10 / bonus max 48) garantissent que la gravité prime
 * toujours sur le nombre de signalements, qui prime toujours sur la
 * fraîcheur — pas d'effet de bord où un "vide" signalé 5 fois dépasserait
 * un "plein" signalé une seule fois.
 */
function computePriorityScore(
  latestStatus: WasteStatus | null,
  latestReportAt: string | null,
  recentReportCount: number
): number {
  const severity = latestStatus ? SEVERITY_WEIGHT[latestStatus] : 0;

  let recencyBonus = 0;
  if (latestReportAt) {
    const hoursSince = (Date.now() - new Date(latestReportAt).getTime()) / (1000 * 60 * 60);
    recencyBonus = Math.max(0, 48 - hoursSince);
  }

  return severity * 100 + recentReportCount * 10 + recencyBonus;
}

/**
 * Lit les points de collecte depuis le cache local, enrichis avec le
 * statut du dernier signalement, le nombre de signalements en attente de
 * synchro, et triés par score de priorité réel (voir computePriorityScore).
 */
export async function getWastePointsWithStatus(): Promise<WastePointWithStatus[]> {
  const db = await getDatabase();

  const points = await db.getAllAsync<any>('SELECT * FROM waste_points ORDER BY name ASC;');

  const latestReports = await db.getAllAsync<any>(`
    SELECT wr.waste_point_id, wr.status, wr.note, wr.created_at
    FROM waste_reports wr
    WHERE wr.created_at = (
      SELECT MAX(created_at) FROM waste_reports WHERE waste_point_id = wr.waste_point_id
    );
  `);
  const latestByPoint = new Map(latestReports.map((r) => [r.waste_point_id, r]));

  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentCountRows = await db.getAllAsync<any>(
    `SELECT waste_point_id, COUNT(*) as recent_count
     FROM waste_reports
     WHERE created_at >= ?
     GROUP BY waste_point_id;`,
    [sevenDaysAgoIso]
  );
  const recentCountByPoint = new Map(recentCountRows.map((r) => [r.waste_point_id, r.recent_count]));

  const pendingRows = await db.getAllAsync<any>(`
    SELECT waste_point_id, COUNT(*) as pending_count
    FROM waste_reports
    WHERE sync_status = 'en_attente'
    GROUP BY waste_point_id;
  `);
  const pendingByPoint = new Map(pendingRows.map((r) => [r.waste_point_id, r.pending_count]));

  const result: WastePointWithStatus[] = points.map((p) => {
    const latest = latestByPoint.get(p.id);
    const latestStatus = (latest?.status as WasteStatus) ?? null;
    const latestReportAt = latest?.created_at ?? null;
    const recentReportCount = recentCountByPoint.get(p.id) ?? 0;

    return {
      id: p.id,
      name: p.name,
      neighborhood: p.neighborhood,
      latitude: p.latitude,
      longitude: p.longitude,
      latestStatus,
      latestNote: latest?.note ?? null,
      latestReportAt,
      recentReportCount,
      priorityScore: computePriorityScore(latestStatus, latestReportAt, recentReportCount),
      pendingCount: pendingByPoint.get(p.id) ?? 0,
    };
  });

  result.sort((a, b) => b.priorityScore - a.priorityScore);

  return result;
}

/**
 * Écrit un signalement en local (offline-first) puis tente une synchro
 * immédiate. Si la tentative échoue (pas de réseau), la ligne reste
 * "en_attente" et sera reprise automatiquement par useAutoSync().
 */
export async function submitWasteReport(
  wastePointId: string,
  status: WasteStatus,
  note: string | null
): Promise<void> {
  const db = await getDatabase();
  const id = generateId();
  const createdAt = new Date().toISOString();

  // user_id à NULL en attendant que le module d'authentification soit en
  // place (pas encore développé à cette étape du hackathon) — à relier
  // à l'utilisateur connecté (auth.users / profiles) une fois dispo.
  await db.runAsync(
    `INSERT INTO waste_reports (id, waste_point_id, user_id, status, note, sync_status, created_at)
     VALUES (?, ?, NULL, ?, ?, 'en_attente', ?);`,
    [id, wastePointId, status, note, createdAt]
  );

  // Tentative optimiste : si ça échoue (offline), pas grave, useAutoSync
  // reprendra au retour du réseau.
  runSync().catch(() => {});
}
