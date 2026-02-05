export default {
  expo: {
    name: 'Port Management',
    slug: 'portmanagement',
    version: '1.9.7',
    orientation: 'portrait',
    icon: './assets/bootsplash/logo.png',
    userInterfaceStyle: 'automatic',
    scheme: 'portmanagement',

    splash: {
      image: './assets/bootsplash/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF'
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.portmanagement',
      buildNumber: '27',
      googleServicesFile:
        './native-backup/Firebase/Prod/GoogleService-Info.plist',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Esta app necesita acceso a tu ubicación para registrar entradas y salidas.',
        NSLocationAlwaysUsageDescription:
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
        foregroundImage: './assets/bootsplash/logo.png',
        backgroundColor: '#FFFFFF'
      },
      package: 'com.portmanagement',
      versionCode: 27,
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
          image: './assets/bootsplash/logo.png',
          backgroundColor: '#FFFFFF',
          imageWidth: 200
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
      './plugins/withAndroidSigning.js',
      './plugins/withAndroidSigningConfig.js'
    ],

    extra: {
      eas: {
        projectId: 'your-eas-project-id' // Actualizar después de eas init
      }
    }
  }
};
