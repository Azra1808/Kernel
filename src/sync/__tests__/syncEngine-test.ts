/**
 * Tests de synchronisation offline → online — tâche n°21.
 *
 * Le moteur de synchro (syncEngine.ts) est partagé par tous les modules de
 * données (Agriculture / diagnoses, Ressources / waste_reports, Paramètres /
 * user_settings, Assistant / chat_messages). On le teste ici une seule fois,
 * de façon générique, avec trois tables factices qui représentent ces trois
 * modules de données plutôt que de dupliquer le même test pour chaque écran.
 *
 * Ce que ces tests garantissent, conformément à la description de la
 * tâche 21 :
 *  - une ligne écrite hors ligne ('en_attente') est bien envoyée à Supabase
 *    dès qu'une synchro est déclenchée ;
 *  - une fois synchronisée, elle n'est plus jamais renvoyée (pas de
 *    duplication) ;
 *  - si l'envoi échoue (coupure réseau), la donnée locale n'est pas perdue :
 *    elle reste 'en_attente' et sera retentée plus tard ;
 *  - un problème sur une table (ex. colonne manquante) n'empêche pas la
 *    synchro des autres tables ;
 *  - deux synchros déclenchées en même temps (ex. reconnexion réseau +
 *    minuteur périodique de useAutoSync) ne traitent pas deux fois les
 *    mêmes lignes en attente.
 */

type FakeRow = Record<string, unknown> & { id: string; sync_status: string };

/**
 * Base SQLite factice en mémoire. Ne comprend que les deux requêtes que
 * syncEngine exécute réellement, ce qui suffit à tester le moteur sans
 * dépendre du module natif expo-sqlite (indisponible sous Jest).
 */
function createFakeDatabase(initialTables: Record<string, FakeRow[]>) {
  const tables: Record<string, FakeRow[]> = JSON.parse(JSON.stringify(initialTables));

  return {
    tables,
    async getAllAsync(sql: string): Promise<FakeRow[]> {
      const match = sql.match(/FROM (\w+) WHERE sync_status = 'en_attente' ORDER BY (\w+)/);
      if (!match) throw new Error(`Requête SELECT inattendue dans le test : ${sql}`);
      const [, tableName, orderColumn] = match;
      const rows = tables[tableName] ?? [];
      return rows
        .filter((r) => r.sync_status === 'en_attente')
        .slice()
        .sort((a, b) => String(a[orderColumn]).localeCompare(String(b[orderColumn])));
    },
    async runAsync(sql: string, params: unknown[]): Promise<void> {
      const match = sql.match(/UPDATE (\w+) SET sync_status = 'synchronise', synced_at = \? WHERE id = \?/);
      if (!match) throw new Error(`Requête UPDATE inattendue dans le test : ${sql}`);
      const [, tableName] = match;
      const [syncedAt, id] = params as [string, string];
      const row = (tables[tableName] ?? []).find((r) => r.id === id);
      if (row) {
        row.sync_status = 'synchronise';
        (row as any).synced_at = syncedAt;
      }
    },
  };
}

describe('syncEngine — synchronisation offline → online (tâche 21)', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("envoie les lignes 'en_attente' à Supabase et marque chaque module comme synchronisé", async () => {
    const upsertMock = jest.fn().mockResolvedValue({ error: null });
    jest.doMock('../../lib/supabase', () => ({ supabase: { from: () => ({ upsert: upsertMock }) } }));

    const fakeDb = createFakeDatabase({
      diagnoses: [
        { id: 'd1', sync_status: 'en_attente', created_at: '2026-09-01T08:00:00Z', crop_type: 'manioc' },
      ],
      waste_reports: [
        { id: 'w1', sync_status: 'en_attente', created_at: '2026-09-01T09:00:00Z', status: 'plein' },
      ],
      user_settings: [
        { id: 'u1', sync_status: 'en_attente', updated_at: '2026-09-01T10:00:00Z', theme: 'sombre' },
      ],
    });
    jest.doMock('../../db/database', () => ({ getDatabase: async () => fakeDb }));

    const { registerSyncableTable, runSync } = require('../syncEngine');

    registerSyncableTable({ tableName: 'diagnoses', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });
    registerSyncableTable({ tableName: 'waste_reports', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });
    registerSyncableTable({
      tableName: 'user_settings',
      orderColumn: 'updated_at',
      toRemotePayload: (r: FakeRow) => ({ id: r.id }),
    });

    const results = await runSync();

    // Les 3 modules de données ont bien été traités, chacun avec sa ligne envoyée.
    expect(results).toEqual(
      expect.arrayContaining([
        { table: 'diagnoses', attempted: 1, succeeded: 1, failed: 0 },
        { table: 'waste_reports', attempted: 1, succeeded: 1, failed: 0 },
        { table: 'user_settings', attempted: 1, succeeded: 1, failed: 0 },
      ])
    );
    expect(upsertMock).toHaveBeenCalledTimes(3);
    expect(upsertMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'd1' }), { onConflict: 'id' });

    // Statut local mis à jour : plus 'en_attente' une fois envoyé.
    expect(fakeDb.tables.diagnoses[0].sync_status).toBe('synchronise');
    expect(fakeDb.tables.waste_reports[0].sync_status).toBe('synchronise');
    expect(fakeDb.tables.user_settings[0].sync_status).toBe('synchronise');
  });

  it('ne renvoie jamais une ligne déjà synchronisée (pas de duplication au retour du réseau)', async () => {
    const upsertMock = jest.fn().mockResolvedValue({ error: null });
    jest.doMock('../../lib/supabase', () => ({ supabase: { from: () => ({ upsert: upsertMock }) } }));

    const fakeDb = createFakeDatabase({
      waste_reports: [{ id: 'w1', sync_status: 'en_attente', created_at: '2026-09-01T09:00:00Z' }],
    });
    jest.doMock('../../db/database', () => ({ getDatabase: async () => fakeDb }));

    const { registerSyncableTable, runSync } = require('../syncEngine');
    registerSyncableTable({ tableName: 'waste_reports', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });

    // Première synchro (ex. retour de connexion) : envoie la ligne.
    const first = await runSync();
    expect(first).toEqual([{ table: 'waste_reports', attempted: 1, succeeded: 1, failed: 0 }]);

    // Deuxième synchro (ex. minuteur périodique de useAutoSync, 30s plus
    // tard) : la ligne est déjà 'synchronise', elle ne doit plus repartir.
    const second = await runSync();
    expect(second).toEqual([{ table: 'waste_reports', attempted: 0, succeeded: 0, failed: 0 }]);
    expect(upsertMock).toHaveBeenCalledTimes(1);
  });

  it("garde une ligne 'en_attente' si l'envoi échoue, sans perdre la donnée locale", async () => {
    const upsertMock = jest.fn().mockResolvedValue({ error: new Error('offline') });
    jest.doMock('../../lib/supabase', () => ({ supabase: { from: () => ({ upsert: upsertMock }) } }));

    const fakeDb = createFakeDatabase({
      diagnoses: [{ id: 'd1', sync_status: 'en_attente', created_at: '2026-09-01T08:00:00Z' }],
    });
    jest.doMock('../../db/database', () => ({ getDatabase: async () => fakeDb }));

    const { registerSyncableTable, runSync } = require('../syncEngine');
    registerSyncableTable({ tableName: 'diagnoses', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });

    const results = await runSync();

    expect(results).toEqual([{ table: 'diagnoses', attempted: 1, succeeded: 0, failed: 1 }]);
    // La ligne reste 'en_attente' : rien n'est perdu, elle sera retentée.
    expect(fakeDb.tables.diagnoses[0].sync_status).toBe('en_attente');
  });

  it('mode démo (Supabase non configuré) : les lignes restent en attente sans planter', async () => {
    jest.doMock('../../lib/supabase', () => ({ supabase: null }));

    const fakeDb = createFakeDatabase({
      waste_reports: [{ id: 'w1', sync_status: 'en_attente', created_at: '2026-09-01T09:00:00Z' }],
    });
    jest.doMock('../../db/database', () => ({ getDatabase: async () => fakeDb }));

    const { registerSyncableTable, runSync } = require('../syncEngine');
    registerSyncableTable({ tableName: 'waste_reports', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });

    const results = await runSync();

    expect(results).toEqual([{ table: 'waste_reports', attempted: 1, succeeded: 0, failed: 1 }]);
    expect(fakeDb.tables.waste_reports[0].sync_status).toBe('en_attente');
  });

  it("un module en erreur (ex. table pas encore prête) n'empêche pas la synchro des autres modules", async () => {
    const upsertMock = jest.fn().mockResolvedValue({ error: null });
    jest.doMock('../../lib/supabase', () => ({ supabase: { from: () => ({ upsert: upsertMock }) } }));

    const fakeDb = createFakeDatabase({
      waste_reports: [{ id: 'w1', sync_status: 'en_attente', created_at: '2026-09-01T09:00:00Z' }],
    });
    // 'diagnoses' n'existe pas dans la fausse base -> getAllAsync lèverait
    // une erreur de requête (colonne/table manquante), simulée ici en
    // enregistrant un nom de table qui ne matche pas le pattern attendu.
    jest.doMock('../../db/database', () => ({
      getDatabase: async () => ({
        ...fakeDb,
        getAllAsync: async (sql: string) => {
          if (sql.includes('diagnoses')) throw new Error('no such table: diagnoses');
          return fakeDb.getAllAsync(sql);
        },
      }),
    }));

    const { registerSyncableTable, runSync } = require('../syncEngine');
    registerSyncableTable({ tableName: 'diagnoses', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });
    registerSyncableTable({ tableName: 'waste_reports', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });

    const results = await runSync();

    expect(results).toEqual(
      expect.arrayContaining([
        { table: 'diagnoses', attempted: 0, succeeded: 0, failed: 0 },
        { table: 'waste_reports', attempted: 1, succeeded: 1, failed: 0 },
      ])
    );
  });

  it('deux synchros lancées en parallèle ne traitent pas deux fois les mêmes lignes', async () => {
    const upsertMock = jest.fn().mockResolvedValue({ error: null });
    jest.doMock('../../lib/supabase', () => ({ supabase: { from: () => ({ upsert: upsertMock }) } }));

    const fakeDb = createFakeDatabase({
      waste_reports: [
        { id: 'w1', sync_status: 'en_attente', created_at: '2026-09-01T09:00:00Z' },
        { id: 'w2', sync_status: 'en_attente', created_at: '2026-09-01T09:05:00Z' },
      ],
    });
    jest.doMock('../../db/database', () => ({ getDatabase: async () => fakeDb }));

    const { registerSyncableTable, runSync } = require('../syncEngine');
    registerSyncableTable({ tableName: 'waste_reports', toRemotePayload: (r: FakeRow) => ({ id: r.id }) });

    // Simule la reconnexion réseau (useAutoSync) et le minuteur périodique
    // qui déclenchent runSync() quasi simultanément.
    const [resultsA, resultsB] = await Promise.all([runSync(), runSync()]);

    expect(resultsA).toBe(resultsB); // même exécution partagée, pas deux passes
    expect(upsertMock).toHaveBeenCalledTimes(2); // une fois par ligne, jamais deux fois
    expect(fakeDb.tables.waste_reports.every((r) => r.sync_status === 'synchronise')).toBe(true);
  });
});
