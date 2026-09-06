import { registerSyncableTable } from './syncEngine';

/**
 * Point d'enregistrement unique de toutes les tables synchronisables.
 * À appeler une fois au démarrage de l'app (voir App.tsx), avant tout
 * appel à runSync(). Chaque module qui a besoin d'écrire en local +
 * synchroniser vers Supabase ajoute sa table ici — pas de logique de
 * sync à écrire dans les écrans eux-mêmes.
 */
export function registerAllSyncableTables(): void {
  registerSyncableTable({
    tableName: 'diagnoses',
    toRemotePayload: (row) => ({
      id: row.id,
      user_id: row.user_id,
      image_url: row.image_url,
      crop_type: row.crop_type,
      disease_predicted: row.disease_predicted,
      confidence: row.confidence,
      advice_text: row.advice_text,
      language: row.language,
      created_at: row.created_at,
    }),
  });

  registerSyncableTable({
    tableName: 'waste_reports',
    toRemotePayload: (row) => ({
      id: row.id,
      waste_point_id: row.waste_point_id,
      user_id: row.user_id,
      status: row.status,
      note: row.note,
      created_at: row.created_at,
    }),
  });

  registerSyncableTable({
    tableName: 'chat_messages',
    toRemotePayload: (row) => ({
      id: row.id,
      user_id: row.user_id,
      sender: row.sender,
      content: row.content,
      created_at: row.created_at,
    }),
  });

  registerSyncableTable({
    tableName: 'user_settings',
    orderColumn: 'updated_at',
    toRemotePayload: (row) => ({
      id: row.id,
      user_id: row.user_id,
      theme: row.theme,
      language: row.language,
      text_size: row.text_size,
      updated_at: row.updated_at,
    }),
  });
}
