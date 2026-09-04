export type SyncStatus = 'en_attente' | 'synchronise';

// Champs communs à toute table locale synchronisable. Chaque module étend
// ceci avec ses propres colonnes (voir database.ts).
export interface SyncableRow {
  id: string;
  sync_status: SyncStatus;
  created_at: string;
  synced_at: string | null;
}
