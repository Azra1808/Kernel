import { FALLBACK_RESPONSE, INTENTS } from './intents';
import type { Intent, Lang } from './types';

// Table de correspondance volontairement simple plutôt que
// String.prototype.normalize('NFD') — évite toute dépendance au support
// ICU du moteur JS embarqué (Hermes), pas garanti identique sur tous les
// appareils bas de gamme visés par le projet.
const ACCENTS: Record<string, string> = {
  à: 'a', â: 'a', ä: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  î: 'i', ï: 'i',
  ô: 'o', ö: 'o',
  ù: 'u', û: 'u', ü: 'u',
  ç: 'c',
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => ACCENTS[ch] ?? ch)
    .join('')
    .trim();
}

export type IntentMatch = {
  intent: Intent | null;
  response: string;
};

/**
 * Trouve l'intention dont le plus grand nombre de mots-clés (dans la
 * langue donnée) apparaît dans le message. En cas d'égalité, la première
 * intention définie l'emporte. Retourne le fallback si rien ne matche.
 *
 * TODO (tâche n°19) : `lang` est actuellement toujours passé en dur
 * comme 'fr' par AssistantScreen. Une fois l'écran Paramètres et la
 * lecture de user_settings.language en place, remplacer cette valeur
 * figée par la vraie préférence de l'utilisateur — aucune autre
 * modification de ce fichier ne sera nécessaire, le contenu anglais est
 * déjà prêt dans intents.ts.
 */
export function matchIntent(userMessage: string, lang: Lang = 'fr'): IntentMatch {
  const normalized = normalize(userMessage);

  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    const score = intent.keywords[lang].reduce(
      (count, keyword) => (normalized.includes(normalize(keyword)) ? count + 1 : count),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (!best) {
    return { intent: null, response: FALLBACK_RESPONSE[lang] };
  }

  const responses = best.responses[lang];
  const response = responses[Math.floor(Math.random() * responses.length)];
  return { intent: best, response };
}

/** Résout une intention par son id — utilisé quand une puce de réponse rapide pointe vers un intentId. */
export function getIntentById(id: string): Intent | undefined {
  return INTENTS.find((i) => i.id === id);
}
