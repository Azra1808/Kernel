import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';

export type AuthState = {
  loading: boolean;
  session: Session | null;
  /** true si l'utilisateur n'a jamais créé de vrai compte (session anonyme uniquement, voir session.ts) */
  isAnonymous: boolean;
  email: string | null;
};

/**
 * Hook réactif sur l'état d'authentification — utilisé par ParametresScreen
 * pour afficher "connecté en tant que ..." ou "non connecté", et se met à
 * jour automatiquement après une connexion/inscription/déconnexion.
 */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>(() =>
    isSupabaseConfigured
      ? { loading: true, session: null, isAnonymous: true, email: null }
      : { loading: false, session: null, isAnonymous: true, email: null }
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setState(toAuthState(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(toAuthState(session));
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return state;
}

function toAuthState(session: Session | null): AuthState {
  return {
    loading: false,
    session,
    isAnonymous: !session || session.user.is_anonymous === true,
    email: session?.user.email ?? null,
  };
}

export type AuthResult = { ok: true } | { ok: false; message: string };

/**
 * Inscription — tâche n°6. Si l'utilisateur a déjà une session anonyme
 * (très probable : elle est créée automatiquement dès qu'il utilise
 * l'assistant en ligne, signale un déchet ou enregistre un diagnostic —
 * voir session.ts), on la CONVERTIT en vrai compte via updateUser()
 * plutôt que de créer un nouvel utilisateur. Ça permet de garder le même
 * auth.uid() et donc de conserver tout ce qui a déjà été fait avant
 * l'inscription (diagnostics, signalements en attente de synchro).
 */
export async function signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: 'Supabase non configuré.' };
  }

  const { data: current } = await supabase.auth.getSession();
  const hasAnonymousSession = current.session?.user.is_anonymous === true;

  const { error } = hasAnonymousSession
    ? await supabase.auth.updateUser({ email, password, data: { full_name: fullName } })
    : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

  if (error) {
    return { ok: false, message: translateAuthError(error.message) };
  }

  // Le trigger handle_new_user() (tâche n°3) a déjà créé la ligne profiles
  // à la création du compte anonyme — on met juste le nom à jour ici.
  if (fullName) {
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', current.session?.user.id ?? '');
  }

  return { ok: true };
}

/**
 * Connexion à un compte déjà existant.
 *
 * ⚠️ Limite connue : si l'appareil avait une session anonyme locale avec
 * des données pas encore synchronisées (ex. diagnostic fait avant de se
 * connecter), signInWithPassword() remplace la session par celle du
 * compte existant — un auth.uid() différent. Ces données locales
 * resteront associées à l'ancien id anonyme et ne se rattacheront pas
 * automatiquement au compte. Cas rare en pratique (il faudrait avoir
 * utilisé l'app hors ligne AVANT de se connecter à un compte déjà créé
 * sur un autre appareil) mais à garder en tête — amélioration possible
 * plus tard : ré-étiqueter les lignes locales "en_attente" avec le
 * nouvel id avant de synchroniser.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: 'Supabase non configuré.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, message: translateAuthError(error.message) };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

function translateAuthError(message: string): string {
  const known: Record<string, string> = {
    'Invalid login credentials': 'Email ou mot de passe incorrect.',
    'User already registered': 'Un compte existe déjà avec cet email.',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
    'Unable to validate email address: invalid format': "Format d'email invalide.",
  };
  return known[message] ?? message;
}
