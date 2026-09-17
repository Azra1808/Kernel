/**
 * Noms des familles de police à utiliser dans les styles StyleSheet.
 * Chargées au démarrage de l'app via useFonts (voir App.tsx).
 *
 * - Fraunces  → titres d'écran, wordmark Kernel (serif éditoriale)
 * - Space Grotesk → texte courant, boutons, libellés (UI)
 */
export const fonts = {
  titleRegular: 'Fraunces_400Regular',
  titleSemiBold: 'Fraunces_600SemiBold',
  titleBold: 'Fraunces_700Bold',
  body: 'SpaceGrotesk_400Regular',
  bodyMedium: 'SpaceGrotesk_500Medium',
  bodySemiBold: 'SpaceGrotesk_600SemiBold',
  bodyBold: 'SpaceGrotesk_700Bold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
} as const;
