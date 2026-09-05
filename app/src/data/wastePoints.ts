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

/**
 * Lit les points de collecte depuis le cache local, enrichis avec le
 * statut du dernier signalement et le nombre de signalements en attente
 * de synchro. Tri temporaire : points signalés "plein" en premier, puis
 * "partiel", puis "vide", puis jamais signalés — ceci sera remplacé par
 * le vrai score de priorisation de la tâche n°14.
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

  const pendingRows = await db.getAllAsync<any>(`
    SELECT waste_point_id, COUNT(*) as pending_count
    FROM waste_reports
    WHERE sync_status = 'en_attente'
    GROUP BY waste_point_id;
  `);
  const pendingByPoint = new Map(pendingRows.map((r) => [r.waste_point_id, r.pending_count]));

  const statusRank: Record<string, number> = { plein: 0, partiel: 1, vide: 2 };

  const result: WastePointWithStatus[] = points.map((p) => {
    const latest = latestByPoint.get(p.id);
    return {
      id: p.id,
      name: p.name,
      neighborhood: p.neighborhood,
      latitude: p.latitude,
      longitude: p.longitude,
      latestStatus: (latest?.status as WasteStatus) ?? null,
      latestNote: latest?.note ?? null,
      latestReportAt: latest?.created_at ?? null,
      pendingCount: pendingByPoint.get(p.id) ?? 0,
    };
  });

  result.sort((a, b) => {
    const rankA = a.latestStatus ? statusRank[a.latestStatus] : 3;
    const rankB = b.latestStatus ? statusRank[b.latestStatus] : 3;
    if (rankA !== rankB) return rankA - rankB;
    // À égalité de statut, le signalement le plus récent d'abord.
    return (b.latestReportAt ?? '').localeCompare(a.latestReportAt ?? '');
  });

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
