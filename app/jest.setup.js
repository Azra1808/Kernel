// Mock officiel d'AsyncStorage pour Jest — son module natif n'existe pas
// dans l'environnement de test, donc tout composant qui l'utilise (via
// PreferencesContext) plante sans ce mock. Voir la doc AsyncStorage :
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
