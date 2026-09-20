import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kernel:onboarding-seen';

/**
 * true si l'utilisateur a déjà vu l'écran Connexion/Inscription au moins
 * une fois sur cet appareil (qu'il ait créé un compte ou choisi de
 * continuer sans compte). Vérification 100% locale — aucune attente
 * réseau au démarrage, cohérent avec le principe offline-first.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value === 'true';
  } catch {
    // En cas de doute (storage indisponible), on préfère ne PAS bloquer
    // l'utilisateur avec l'écran d'auth à chaque lancement.
    return true;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Non bloquant.
  }
}
