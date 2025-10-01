module.exports = {
  dependencies: {
    'react-native-bootsplash': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-bootsplash/android',
          packageImportPath:
            'import io.invertase.bootsplash.RNBootSplashPackage;'
        }
      }
    }
  }
};
