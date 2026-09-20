import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wrapper AsyncStorage — pour les petites préférences clé/valeur qui n'ont
 * pas besoin des requêtes SQL de SQLite (ex. dernière synchro réussie,
 * thème choisi avant connexion). Pour toute donnée structurée liée à un
 * module (diagnostics, signalements...), utiliser src/db (SQLite) à la place.
 */
const PREFIX = 'kernel:';

export async function getPreference<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(PREFIX + key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setPreference<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function removePreference(key: string): Promise<void> {
  await AsyncStorage.removeItem(PREFIX + key);
}
