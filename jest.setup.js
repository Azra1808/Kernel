// Mock officiel d'AsyncStorage pour Jest — son module natif n'existe pas
// dans l'environnement de test, donc tout composant qui l'utilise (via
// PreferencesContext) plante sans ce mock. Voir la doc AsyncStorage :
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock maison de Reanimated pour Jest (utilisé par AnimatedPressable,
// donc par Button/Card/RootNavigator). Le mock OFFICIEL du package
// (react-native-reanimated/mock) tente, dans cette version, de charger
// les bindings natifs de react-native-worklets — inexistants sous Jest,
// ce qui fait planter toute la suite de tests. On mocke donc uniquement
// les 4 API réellement utilisées dans le code (useSharedValue,
// useAnimatedStyle, withSpring, Animated.View), sans toucher au vrai
// module — largement suffisant pour ce que fait AnimatedPressable.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: { View },
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: (factory) => factory(),
    withSpring: (toValue) => toValue,
  };
});

// expo-haptics appelle du code natif (vibration) qui n'existe pas non
// plus en environnement de test.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
