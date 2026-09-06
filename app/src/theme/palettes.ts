export type Mode = 'clair' | 'sombre';
export type ColorThemeId = 'argile' | 'mousse' | 'or' | 'riviere';

/**
 * Tokens structurels (fond, texte, bordures) — changent selon le mode
 * clair/sombre choisi par l'utilisateur.
 */
const STRUCTURAL_LIGHT = {
  ink: '#1C1A15',
  paper: '#F6F0E2',
  paperWarm: '#EFE4CB',
  line: '#E3D6BB',
  muted: '#8C8268',
  body: '#55503F',
  shell: '#20241F',
  shell2: '#2B3128',
  white: '#FFFFFF',
};

const STRUCTURAL_DARK = {
  ink: '#F3EFE4',
  paper: '#15140F',
  paperWarm: '#1D1B14',
  line: '#332F22',
  muted: '#9C9377',
  body: '#D8D2BF',
  shell: '#20241F',
  shell2: '#2B3128',
  white: '#FFFFFF',
};

/**
 * Couleurs de STATUT — volontairement FIXES, ne changent jamais avec la
 * préférence esthétique de l'utilisateur. "plein" (clay), "vigilance"
 * (gold), "sain" (moss) doivent garder un sens constant partout dans
 * l'app, indépendamment du thème de couleur choisi dans les Paramètres.
 * Ne pas remapper ces valeurs sur ACCENT_THEMES ci-dessous.
 */
const STATUS_COLORS = {
  clay: '#A8432A',
  clayPale: '#F3DBCE',
  gold: '#D79A34',
  goldPale: '#F5E4C4',
  moss: '#3F6B4A',
  mossPale: '#DCE6D5',
  warning: '#8A5F1B',
};

/**
 * Les 4 thèmes de couleur sélectionnables (tâche n°19). Contrôlent
 * uniquement `accent`/`accentPale` — utilisés pour les boutons primaires,
 * l'onglet actif, et les accents de marque. Ne touchent jamais aux
 * couleurs de statut ci-dessus.
 */
export const ACCENT_THEMES: Record<
  ColorThemeId,
  { label: { fr: string; en: string }; accent: string; palLight: string; palDark: string }
> = {
  argile: { label: { fr: 'Argile', en: 'Clay' }, accent: '#A8432A', palLight: '#F3DBCE', palDark: '#3A2019' },
  mousse: { label: { fr: 'Mousse', en: 'Moss' }, accent: '#3F6B4A', palLight: '#DCE6D5', palDark: '#1C2B20' },
  or: { label: { fr: 'Or', en: 'Gold' }, accent: '#D79A34', palLight: '#F5E4C4', palDark: '#332510' },
  riviere: { label: { fr: 'Rivière', en: 'River' }, accent: '#2E6E7E', palLight: '#D8E8EA', palDark: '#16282B' },
};

export const radius = { lg: 26, md: 16, sm: 10 } as const;

export function buildPalette(mode: Mode, colorTheme: ColorThemeId) {
  const structural = mode === 'sombre' ? STRUCTURAL_DARK : STRUCTURAL_LIGHT;
  const accentDef = ACCENT_THEMES[colorTheme];
  return {
    ...structural,
    ...STATUS_COLORS,
    accent: accentDef.accent,
    accentPale: mode === 'sombre' ? accentDef.palDark : accentDef.palLight,
  };
}

export type Palette = ReturnType<typeof buildPalette>;
