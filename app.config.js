export default {
  expo: {
    name: 'Port Management',
    slug: 'portmanagement',
    version: '2.0.1',
    orientation: 'portrait',
    icon: './assets/icon/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'portmanagement',

    splash: {
      image: './assets/bootsplash/splash@2x.png',
      resizeMode: 'cover',
      backgroundColor: '#3B8D7A'
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.port.management', // iOS usa com.port.management
      buildNumber: '30',
      googleServicesFile:
        './native-backup/Firebase/Prod/GoogleService-Info.plist',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Esta app necesita acceso a tu ubicación para registrar entradas y salidas.',
        NSLocationAlwaysUsageDescription:
          'Esta app necesita acceso a tu ubicación para registrar entradas y salidas.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Esta app necesita acceso a tu ubicación para registrar entradas y salidas.',
        NSCameraUsageDescription:
          'Esta app necesita acceso a la cámara para tomar fotos de verificación.',
        NSPhotoLibraryUsageDescription:
          'Esta app necesita acceso a tu galería para seleccionar imágenes.',
        NSPhotoLibraryAddUsageDescription:
          'Esta app necesita permiso para guardar fotos en tu galería.',
        UIBackgroundModes: ['fetch', 'remote-notification']
      }
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon/icon.png',
        backgroundColor: '#26b45f'
      },
      package: 'com.portmanagement', // Android usa com.portmanagement
      versionCode: 30,
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'INTERNET',
        'ACCESS_NETWORK_STATE'
      ],
      googleServicesFile: './native-backup/google-services.json'
    },

    plugins: [
      'expo-font',
      [
        'expo-splash-screen',
        {
          image: './assets/bootsplash/splash@2x.png',
          resizeMode: 'cover',
          backgroundColor: '#3B8D7A'
        }
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            deploymentTarget: '15.1'
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 24
          }
        }
      ],
      './plugins/withIosDeduplicatePods.js',
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      '@react-native-firebase/messaging',
      '@react-native-firebase/crashlytics',
      './plugins/withFirebaseNonModularFix.js',
      './plugins/withHermesDsym.js',
      './plugins/withAndroidSigning.js',
      './plugins/withAndroidSigningConfig.js',
      './plugins/withFullScreenSplash.js'
    ],

    extra: {
      eas: {
        projectId: 'fa7f00ee-b967-4bed-85f3-32f4deb4df88'
      }
    }
  }
};
