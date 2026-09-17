import type { Intent } from './types';

/**
 * Intentions courantes, définies hors ligne (tâche n°17), contenu prêt en
 * français ET en anglais (préparation tâche n°19). Le moteur choisit
 * encore le français par défaut — voir engine.ts.
 *
 * L'intégration API Claude/Gemini (tâche n°18) prendra le relais pour les
 * questions qui ne matchent aucune intention ci-dessous, dès qu'une
 * connexion est disponible.
 */
export const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keywords: {
      fr: ['bonjour', 'salut', 'bonsoir', 'hello', 'coucou'],
      en: ['hello', 'hi', 'good morning', 'good evening', 'hey'],
    },
    responses: {
      fr: [
        "Bonjour ! Je suis l'assistant Kernel. Je peux t'aider avec le diagnostic des plantes, le signalement de déchets, ou l'état de l'écosystème de ton quartier. Que veux-tu faire ?",
      ],
      en: [
        "Hello! I'm the Kernel assistant. I can help with plant diagnosis, waste reporting, or your neighborhood's ecosystem status. What would you like to do?",
      ],
    },
    quickReplies: [
      { label: { fr: 'Ma plante est malade', en: 'My plant is sick' }, intentId: 'plant_disease' },
      { label: { fr: 'Signaler un déchet', en: 'Report waste' }, intentId: 'waste_report' },
      { label: { fr: "Voir l'écosystème", en: 'View ecosystem' }, intentId: 'ecosystem_info' },
    ],
  },
  {
    id: 'plant_disease',
    keywords: {
      fr: [
        'plante', 'plantes', 'feuille', 'feuilles', 'jaunissent', 'jaunes',
        'malade', 'maladie', 'tache', 'taches', 'culture', 'manioc', 'mais',
        'diagnostic', 'diagnostiquer',
      ],
      en: [
        'plant', 'plants', 'leaf', 'leaves', 'yellow', 'yellowing', 'sick',
        'disease', 'spot', 'spots', 'crop', 'cassava', 'corn', 'maize',
        'diagnosis', 'diagnose',
      ],
    },
    responses: {
      fr: [
        "Pour diagnostiquer une plante, ouvre l'onglet Agriculture et prends une photo nette de la feuille ou de la partie touchée. Le diagnostic fonctionne même sans connexion.",
      ],
      en: [
        "To diagnose a plant, open the Agriculture tab and take a clear photo of the affected leaf or part. Diagnosis works even without a connection.",
      ],
    },
    quickReplies: [
      { label: { fr: "Ouvrir l'onglet Agriculture", en: 'Open Agriculture tab' }, goToTab: 'Agriculture' },
    ],
  },
  {
    id: 'waste_report',
    keywords: {
      fr: [
        'dechet', 'dechets', 'poubelle', 'poubelles', 'ordure', 'ordures',
        'signaler', 'signalement', 'collecte', 'plein', 'point',
      ],
      en: ['waste', 'trash', 'garbage', 'bin', 'bins', 'report', 'reporting', 'collection', 'full', 'point'],
    },
    responses: {
      fr: [
        "Pour signaler un point de collecte plein, va dans l'onglet Ressources, choisis le point concerné et signale-le en un geste. Ça reste enregistré même hors connexion.",
      ],
      en: [
        "To report a full collection point, go to the Resources tab, select the point, and report it in one tap. It stays saved even offline.",
      ],
    },
    quickReplies: [
      { label: { fr: "Ouvrir l'onglet Ressources", en: 'Open Resources tab' }, goToTab: 'Ressources' },
    ],
  },
  {
    id: 'ecosystem_info',
    keywords: {
      fr: [
        'ecosysteme', 'environnement', 'sante', 'indice', 'quartier',
        'communaute', 'statistique', 'statistiques', 'tendance',
      ],
      en: ['ecosystem', 'environment', 'health', 'index', 'neighborhood', 'community', 'statistic', 'statistics', 'trend'],
    },
    responses: {
      fr: [
        "L'onglet Écosystème montre l'indice de santé environnementale de ton quartier, calculé à partir des diagnostics et signalements de toute la communauté.",
      ],
      en: [
        "The Ecosystem tab shows your neighborhood's environmental health index, calculated from diagnoses and reports across the whole community.",
      ],
    },
    quickReplies: [
      { label: { fr: "Ouvrir l'onglet Écosystème", en: 'Open Ecosystem tab' }, goToTab: 'Ecosysteme' },
    ],
  },
  {
    id: 'offline_help',
    keywords: {
      fr: [
        'hors ligne', 'connexion', 'internet', 'reseau', 'synchronisation',
        'synchroniser', 'sync', 'offline',
      ],
      en: ['offline', 'connection', 'internet', 'network', 'sync', 'synchronization', 'synchronize'],
    },
    responses: {
      fr: [
        "Kernel fonctionne sans connexion : tout ce que tu fais est d'abord enregistré sur ton téléphone, puis synchronisé automatiquement dès qu'internet revient. Rien n'est perdu.",
      ],
      en: [
        "Kernel works without a connection: everything you do is first saved on your phone, then automatically synced once internet is back. Nothing is lost.",
      ],
    },
  },
  {
    id: 'settings_help',
    keywords: {
      fr: [
        'parametre', 'parametres', 'reglage', 'reglages', 'langue',
        'theme', 'sombre', 'clair', 'taille', 'texte',
      ],
      en: ['setting', 'settings', 'preference', 'preferences', 'language', 'theme', 'dark', 'light', 'size', 'text'],
    },
    responses: {
      fr: ["Les réglages (thème, langue, taille du texte) sont accessibles depuis l'icône en haut de l'écran Accueil."],
      en: ['Settings (theme, language, text size) are accessible from the icon at the top of the Home screen.'],
    },
    quickReplies: [{ label: { fr: "Retour à l'Accueil", en: 'Back to Home' }, goToTab: 'Accueil' }],
  },
  {
    id: 'thanks',
    keywords: {
      fr: ['merci', 'super', 'top', 'parfait'],
      en: ['thanks', 'thank you', 'great', 'awesome', 'perfect'],
    },
    responses: {
      fr: ['Avec plaisir ! Autre chose ?'],
      en: ['Happy to help! Anything else?'],
    },
  },
];

/** Réponses de repli (par langue), utilisées quand aucune intention ne matche. */
export const FALLBACK_RESPONSE: Record<'fr' | 'en', string> = {
  fr: "Je n'ai pas encore de réponse locale pour ça. Dès qu'une connexion sera disponible, je pourrai transmettre ta question à un assistant plus complet. En attendant, je peux t'aider sur les plantes, les déchets, l'écosystème ou les réglages.",
  en: "I don't have a local answer for that yet. Once a connection is available, I'll be able to forward your question to a more advanced assistant. In the meantime, I can help with plants, waste, the ecosystem, or settings.",
};
