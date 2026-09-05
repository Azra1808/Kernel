import { getDatabase } from '../db/database';
import { supabase } from '../lib/supabase';

/**
 * Moteur de synchronisation générique — Tâche n°7.
 *
 * Principe (voir doc section 2.2) :
 *   Base locale (SQLite, statut "en_attente") → file de synchronisation
 *   → Supabase (dès qu'une connexion est disponible) → statut "synchronise".
 *
 * N'importe quel module (Agriculture, Ressources, Assistant, Paramètres)
 * peut déclarer sa table avec `registerSyncableTable(...)` puis n'a plus
 * qu'à écrire ses lignes localement avec sync_status = 'en_attente' : le
 * moteur se charge du reste. Pas besoin de dupliquer de la logique de
 * synchronisation dans chaque écran.
 */

export interface SyncableTableConfig<TRow extends Record<string, unknown>> {
  /** Nom de la table locale SQLite (= nom de la table Supabase). */
  tableName: string;
  /**
   * Transforme une ligne locale en objet prêt à être envoyé à Supabase
   * (retire les champs purement locaux comme sync_status / synced_at).
   */
  toRemotePayload: (row: TRow) => Record<string, unknown>;
}

const registry = new Map<string, SyncableTableConfig<any>>();

export function registerSyncableTable<TRow extends Record<string, unknown>>(
  config: SyncableTableConfig<TRow>
): void {
  registry.set(config.tableName, config);
}

interface SyncResult {
  table: string;
  attempted: number;
  succeeded: number;
  failed: number;
}

/** Synchronise une seule table (toutes les lignes en_attente). */
async function syncTable(tableName: string): Promise<SyncResult> {
  const config = registry.get(tableName);
  if (!config) {
    throw new Error(`Table "${tableName}" non enregistrée via registerSyncableTable().`);
  }

  const db = await getDatabase();
  const pendingRows = await db.getAllAsync<any>(
    `SELECT * FROM ${tableName} WHERE sync_status = 'en_attente' ORDER BY created_at ASC;`
  );

  const result: SyncResult = { table: tableName, attempted: pendingRows.length, succeeded: 0, failed: 0 };

  for (const row of pendingRows) {
    try {
      if (!supabase) {
        throw new Error('Supabase non configuré (mode démo)');
      }
      const payload = config.toRemotePayload(row);
      // upsert : gère aussi bien la création que la mise à jour d'un
      // enregistrement déjà connu du serveur (ex. réédition hors ligne).
      const { error } = await supabase.from(tableName).upsert(payload, { onConflict: 'id' });
      if (error) throw error;

      const nowIso = new Date().toISOString();
      await db.runAsync(
        `UPDATE ${tableName} SET sync_status = 'synchronise', synced_at = ? WHERE id = ?;`,
        [nowIso, row.id]
      );
      result.succeeded += 1;
    } catch (err) {
      // On laisse la ligne en 'en_attente' : elle sera retentée au prochain
      // passage (reconnexion réseau ou minuteur périodique). On ne perd et
      // on ne duplique jamais de donnée locale ici.
      result.failed += 1;
      if (__DEV__) {
        console.warn(`[sync] échec sync ${tableName}#${row.id}:`, err);
      }
    }
  }

  return result;
}

let syncInFlight: Promise<SyncResult[]> | null = null;

/**
 * Lance une passe de synchronisation sur toutes les tables enregistrées.
 * Sûr à appeler plusieurs fois en parallèle (les appels concurrents
 * partagent la même exécution en cours plutôt que de se marcher dessus).
 */
export async function runSync(): Promise<SyncResult[]> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    const tableNames = Array.from(registry.keys());
    const results: SyncResult[] = [];
    for (const tableName of tableNames) {
      results.push(await syncTable(tableName));
    }
    return results;
  })();

  try {
    return await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}