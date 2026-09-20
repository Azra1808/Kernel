import { isSupabaseConfigured, supabase } from './supabase';

/**
 * Assure une session Supabase, même anonyme, et retourne son user_id.
 *
 * Tant que la tâche n°6 (vraie authentification) n'existe pas, c'est ce
 * qui permet à n'importe quel module (assistant en ligne, diagnostics,
 * signalements...) d'associer ses écritures à un auth.uid() réel plutôt
 * qu'à NULL — indispensable pour que les policies RLS (auth.uid() =
 * user_id) acceptent l'insertion côté Supabase. Sans ça, les lignes
 * écrites avec user_id NULL restent bloquées côté serveur et ne
 * synchronisent jamais (elles restent "en_attente" indéfiniment).
 *
 * Une fois l'auth réelle en place, une session déjà connectée est
 * utilisée directement — rien à changer dans les fichiers qui appellent
 * cette fonction.
 */
export async function ensureUserId(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session) {
    return existing.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    console.warn('[session] échec de la session anonyme :', error?.message);
    return null;
  }
  return data.session.user.id;
}

/** Variante booléenne, utile quand seul l'existence d'une session compte. */
export async function ensureSession(): Promise<boolean> {
  return (await ensureUserId()) !== null;
}
