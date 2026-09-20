import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { ensureUserId } from './session';
import { useAuthState } from './auth';

export type ProfileData = {
  fullName: string | null;
  village: string | null;
};

const CACHE_KEY = 'kernel:profile-cache';

async function readCache(): Promise<ProfileData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeCache(profile: ProfileData): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    // Non bloquant.
  }
}

/**
 * Hook de profil — offline-first : affiche immédiatement la dernière
 * version connue en cache local (AsyncStorage), puis rafraîchit en
 * arrière-plan dès qu'une session + un réseau sont disponibles. Se
 * remet à jour automatiquement après connexion/inscription (dépend de
 * useAuthState()).
 */
export function useProfile() {
  const auth = useAuthState();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const userId = await ensureUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, village')
      .eq('id', userId)
      .single();

    if (!error && data) {
      const next: ProfileData = { fullName: data.full_name || null, village: data.village || null };
      setProfile(next);
      writeCache(next);
    }
    setLoading(false);
  }, []);

  // Affiche le cache tout de suite (rapide, fonctionne hors ligne),
  // pendant que refresh() va chercher la version à jour en arrière-plan.
  useEffect(() => {
    readCache().then((cached) => {
      if (cached) setProfile(cached);
    });
  }, []);

  // Se resynchronise chaque fois que l'état d'authentification change
  // (connexion, inscription, déconnexion) — par ex. le nom se met à jour
  // juste après une inscription.
  useEffect(() => {
    if (!auth.loading) {
      // Pattern voulu : re-fetch le profil chaque fois que l'état d'auth
      // change (connexion/inscription/déconnexion) — refresh() est
      // asynchrone, le setState réel n'arrive qu'après l'appel réseau,
      // pas de façon synchrone dans le corps de l'effet.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refresh();
    }
  }, [auth.loading, auth.session?.user.id, refresh]);

  const updateVillage = useCallback(
    async (village: string): Promise<boolean> => {
      if (!supabase) return false;
      const userId = await ensureUserId();
      if (!userId) return false;

      const { error } = await supabase.from('profiles').update({ village }).eq('id', userId);
      if (error) return false;

      const next: ProfileData = { fullName: profile?.fullName ?? null, village };
      setProfile(next);
      writeCache(next);
      return true;
    },
    [profile]
  );

  return { profile, loading, refresh, updateVillage };
}
