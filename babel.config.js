module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated v4 délègue la compilation des "worklets" à
    // react-native-worklets — plugin OBLIGATOIRE, doit rester le dernier
    // de la liste (contrainte documentée par Reanimated/Worklets).
    plugins: ['react-native-worklets/plugin'],
  };
};
