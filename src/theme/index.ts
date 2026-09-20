// NOTE — Ces exports "colors" statiques (thème clair + argile figés)
// restent disponibles pour compatibilité, mais tout composant/écran qui
// affiche du contenu à l'utilisateur doit préférer usePreferences().colors
// (dynamique, réagit au thème choisi dans les Paramètres, tâche n°19).
export { colors, radius } from './colors';
export { fonts, fontSize } from './typography';
export { Icon } from './Icon';
export type { IconName } from './Icon';
export { buildPalette, ACCENT_THEMES } from './palettes';
export type { Mode, ColorThemeId, Palette } from './palettes';
export { PreferencesProvider, usePreferences } from './PreferencesContext';
export type { TextSize } from './PreferencesContext';
