/**
 * Palette extraite de la maquette validée (assets/design/kernel-mockup.html).
 * Ces valeurs seront étendues en un vrai design system à la tâche n°5
 * (composants réutilisables : carte, bouton, chip, barre de statut).
 * Ne pas dupliquer ces couleurs ailleurs dans le code — toujours importer
 * depuis ce fichier pour garder une seule source de vérité.
 */
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
} as const;

export const radius = {
  lg: 26,
  md: 16,
  sm: 10,
} as const;
