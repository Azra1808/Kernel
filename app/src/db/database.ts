import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Base SQLite unique de l'app. Toutes les tables locales miroitent les
// tables Supabase correspondantes et ajoutent un statut de synchronisation
// (sync_status: 'en_attente' | 'synchronise') quand la donnée est écrite
// par l'utilisateur. Les tables purement "cache en lecture" (ex. waste_points,
// qui vient du serveur et n'est jamais modifiée en local) n'ont pas ce champ.
//
// NOTE — web : le support web d'expo-sqlite est encore "alpha" côté Expo
// (WebAssembly + SharedArrayBuffer, voir metro.config.js). Comme Kernel est
// avant tout une application mobile, on ne bloque jamais le lancement de
// l'app sur le web si SQLite échoue à s'initialiser : le stockage offline
// réel doit être testé sur Expo Go (téléphone) ou un émulateur Android/iOS.

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('kernel.db');
  }
  return dbInstance;
}

// Schéma local. Reprend les colonnes des tables Supabase définies dans la
// documentation (section 4), en local: id en TEXT (uuid généré côté client
// avec crypto.randomUUID ou une lib uuid), timestamps en TEXT ISO8601.
const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS diagnoses (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT,
  image_url TEXT,
  crop_type TEXT,
  disease_predicted TEXT,
  confidence REAL,
  advice_text TEXT,
  language TEXT,
  sync_status TEXT NOT NULL DEFAULT 'en_attente',
  created_at TEXT NOT NULL,
  synced_at TEXT
);

CREATE TABLE IF NOT EXISTS waste_points (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  latitude REAL,
  longitude REAL,
  neighborhood TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS waste_reports (
  id TEXT PRIMARY KEY NOT NULL,
  waste_point_id TEXT NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL,
  note TEXT,
  sync_status TEXT NOT NULL DEFAULT 'en_attente',
  created_at TEXT NOT NULL,
  synced_at TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'en_attente',
  created_at TEXT NOT NULL,
  synced_at TEXT
);

CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  theme TEXT,
  language TEXT,
  text_size TEXT,
  sync_status TEXT NOT NULL DEFAULT 'en_attente',
  updated_at TEXT NOT NULL,
  synced_at TEXT
);
`;

export async function initDatabase(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.execAsync(SCHEMA_SQL);
  } catch (err) {
    if (Platform.OS === 'web') {
      // Support web alpha : on n'empêche pas l'app de démarrer dans le
      // navigateur si SQLite/WASM échoue. Le stockage offline doit être
      // validé sur Expo Go (téléphone) ou un émulateur, pas sur le web.
      console.warn(
        "[db] SQLite indisponible sur le web (support alpha d'expo-sqlite). " +
          "L'app continue sans stockage offline dans ce mode — teste sur Expo Go pour la fonctionnalité complète.",
        err
      );
      return;
    }
    throw err;
  }
}
