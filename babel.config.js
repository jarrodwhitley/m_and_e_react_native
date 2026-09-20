module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // must be listed last per react-native-reanimated v4 / react-native-worklets setup
    plugins: ['react-native-worklets/plugin'],
  };
};
