/**
 * Génère un UUID v4. On évite d'ajouter une dépendance (expo-crypto) pour
 * ça : ces ids ne servent qu'à identifier une ligne de façon unique côté
 * client avant/après synchro, pas à des fins cryptographiques.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
