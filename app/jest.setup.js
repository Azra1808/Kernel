// Mock officiel d'AsyncStorage pour Jest — son module natif n'existe pas
// dans l'environnement de test, donc tout composant qui l'utilise (via
// PreferencesContext) plante sans ce mock. Voir la doc AsyncStorage :
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock officiel de Reanimated pour Jest (utilisé par AnimatedPressable,
// donc par Button/Card). Sans ce mock, Jest tente de faire tourner les
// animations pour de vrai, ce qui ralentit énormément les tests jusqu'au
// timeout, voire les bloque.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// expo-haptics appelle du code natif (vibration) qui n'existe pas non
// plus en environnement de test.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
