import NetInfo from '@react-native-community/netinfo';
import { isSupabaseConfigured, supabase } from './supabase';
import type { Lang } from './assistant/types';

/**
 * Assure une session Supabase, même anonyme, uniquement pour obtenir un
 * JWT valide côté client — nécessaire pour appeler l'Edge Function
 * assistant-fallback (protégée par défaut par la vérification JWT de
 * Supabase). Tant que la tâche n°6 n'existe pas, tous les utilisateurs
 * passent par ici. Une fois l'auth réelle en place, une session déjà
 * connectée est utilisée directement (rien à changer dans ce fichier).
 */
async function ensureSession(): Promise<boolean> {
  if (!supabase) return false;

  const { data } = await supabase.auth.getSession();
  if (data.session) return true;

  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('[assistantOnline] échec de la session anonyme :', error.message);
    return false;
  }
  return true;
}

async function isNetworkAvailable(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export type OnlineAssistantResult =
  | { ok: true; reply: string }
  | { ok: false; reason: 'offline' | 'not_configured' | 'request_failed' };

/**
 * Tente de transmettre une question à l'API en ligne (Gemini, via l'Edge
 * Function assistant-fallback) — tâche n°18. N'est appelé QUE quand le
 * moteur hors ligne (tâche n°17) n'a trouvé aucune intention locale.
 * Ne lève jamais d'exception : l'appelant peut toujours se replier
 * silencieusement sur FALLBACK_RESPONSE (voir intents.ts).
 */
export async function askAssistantOnline(message: string, language: Lang): Promise<OnlineAssistantResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, reason: 'not_configured' };
  }

  const online = await isNetworkAvailable();
  if (!online) {
    return { ok: false, reason: 'offline' };
  }

  const hasSession = await ensureSession();
  if (!hasSession) {
    return { ok: false, reason: 'request_failed' };
  }

  try {
    const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string }>(
      'assistant-fallback',
      { body: { message, language } }
    );

    if (error || !data?.reply) {
      console.warn('[assistantOnline] échec de l’appel à assistant-fallback :', error?.message ?? data?.error);
      return { ok: false, reason: 'request_failed' };
    }

    return { ok: true, reply: data.reply };
  } catch (err) {
    console.warn('[assistantOnline] exception réseau :', err);
    return { ok: false, reason: 'request_failed' };
  }
}
