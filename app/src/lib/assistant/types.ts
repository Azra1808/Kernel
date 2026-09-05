import type { RootTabParamList } from '../../navigation/RootNavigator';

/**
 * Langues supportées. Reflète language_pref (profiles / user_settings côté
 * Supabase, voir doc 4.1/4.7). Le moteur accepte déjà les deux, mais RIEN
 * ne lit encore la vraie préférence utilisateur — voir engine.ts et
 * AssistantScreen.tsx pour le TODO explicite. Câblage réel prévu à la
 * tâche n°19 (écran Paramètres), une fois qu'il existe un endroit pour
 * choisir/stocker cette préférence.
 */
export type Lang = 'fr' | 'en';

export type LocalizedText = Record<Lang, string>;

export type QuickReply = {
  label: LocalizedText;
  /** Si présent, appuyer sur la puce navigue directement vers cet onglet */
  goToTab?: keyof RootTabParamList;
  /** Sinon, appuyer sur la puce relance le moteur avec cette intention */
  intentId?: string;
};

export type Intent = {
  id: string;
  /** Mots-clés (en minuscules, sans accents) par langue */
  keywords: Record<Lang, string[]>;
  /** Réponse(s) possibles par langue — une est choisie au hasard */
  responses: Record<Lang, string[]>;
  quickReplies?: QuickReply[];
};
