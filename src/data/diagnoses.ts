import { getDatabase } from '../db/database';
import { ensureUserId } from '../lib/session';
import { generateId } from '../lib/uuid';
import { runSync } from '../sync/syncEngine';
import type { PlantDiagnosisResult } from '../lib/plantModel';
import type { Lang } from '../lib/assistant/types';

export interface SavedDiagnosis extends PlantDiagnosisResult {
  id: string;
  imageUri: string;
  language: Lang;
  createdAt: string;
}

/**
 * Enregistre un diagnostic — tâche n°11. Écrit toujours en local d'abord
 * (principe offline-first, comme submitWasteReport) : la synchronisation
 * réelle vers Supabase est reprise par useAutoSync dès que le réseau
 * revient, via la table déjà enregistrée dans registerTables.ts.
 *
 * NOTE — image_url : pour l'instant, on stocke l'URI locale du fichier
 * tel que rendu par expo-camera/expo-image-picker. Un vrai upload vers
 * Supabase Storage (bucket privé, comme prévu par la doc 5.3) reste à
 * faire — actuellement hors scope de la tâche n°11 telle que découpée
 * dans le classeur, qui ne mentionne que l'enregistrement en base.
 */
export async function saveDiagnosis(
  imageUri: string,
  cropType: string,
  result: PlantDiagnosisResult,
  language: Lang
): Promise<SavedDiagnosis> {
  const db = await getDatabase();
  const id = generateId();
  const createdAt = new Date().toISOString();

  // Session anonyme en attendant la tâche n°6 — voir session.ts pour le
  // détail de pourquoi c'est nécessaire (RLS côté Supabase).
  const userId = await ensureUserId();

  await db.runAsync(
    `INSERT INTO diagnoses
       (id, user_id, image_url, crop_type, disease_predicted, confidence, advice_text, language, severity, sync_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', ?);`,
    [
      id,
      userId,
      imageUri,
      cropType,
      result.diseaseLabel,
      result.confidence,
      result.advice,
      language,
      result.severity,
      createdAt,
    ]
  );

  // Tentative optimiste : si offline, useAutoSync reprendra plus tard.
  runSync().catch(() => {});

  return {
    ...result,
    id,
    imageUri,
    language,
    createdAt,
  };
}

/** Historique local des diagnostics, du plus récent au plus ancien. */
export async function getDiagnosisHistory(limit = 20): Promise<SavedDiagnosis[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    image_url: string;
    crop_type: string;
    disease_predicted: string;
    confidence: number;
    advice_text: string;
    language: string;
    severity: string;
    created_at: string;
  }>(`SELECT * FROM diagnoses ORDER BY created_at DESC LIMIT ?;`, [limit]);

  return rows.map((row) => ({
    id: row.id,
    imageUri: row.image_url,
    cropType: row.crop_type,
    diseaseKey: '',
    diseaseLabel: row.disease_predicted,
    confidence: row.confidence,
    advice: row.advice_text,
    language: (row.language as Lang) ?? 'fr',
    severity: (row.severity as PlantDiagnosisResult['severity']) ?? 'moyen',
    createdAt: row.created_at,
  }));
}
