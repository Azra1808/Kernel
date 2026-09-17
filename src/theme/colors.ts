/** Source de vérité visuelle extraite de la maquette validée. */
export const colors = {
  ink: '#1C1A15',
  paper: '#F6F0E2',
  paperWarm: '#EFE4CB',
  clay: '#A8432A',
  clayPale: '#F3DBCE',
  gold: '#D79A34',
  goldPale: '#F5E4C4',
  moss: '#3F6B4A',
  mossPale: '#DCE6D5',
  line: '#E3D6BB',
  shell: '#20241F',
  shell2: '#2B3128',
  muted: '#8C8268',
  body: '#55503F',
  white: '#FFFFFF',
  warning: '#8A5F1B',
} as const;

export const radius = {
  lg: 26,
  md: 16,
  sm: 10,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const fontFamily = {
  body: 'SpaceGrotesk_400Regular',
  bodyMedium: 'SpaceGrotesk_500Medium',
  bodySemibold: 'SpaceGrotesk_600SemiBold',
  displaySemibold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
} as const;

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
} as const;
