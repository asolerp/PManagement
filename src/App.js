import React, { useEffect, useState, useCallback } from 'react';
import { View, Platform, Alert } from 'react-native';
import AuthRouter from './Router/authRouter';
import i18n from 'i18next';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
  setAttribute as crashSetAttribute,
  log as crashLog
} from '@react-native-firebase/crashlytics';
import { Logger } from './lib/logging';

// Suprimir warnings de deprecación de react-firebase-hooks
// Esta librería aún no ha sido actualizada para v22 y genera warnings internos
// TODO: Migrar a hooks personalizados o esperar actualización de react-firebase-hooks
if (globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS === undefined) {
  globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
}

import ErrorBoundary from 'react-native-error-boundary';

import { Provider } from 'react-redux';
import store from './Store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import * as Localization from 'expo-localization';
import './Translations';

import { ErrorScreen } from './Screens/Error';
import { useLocales } from './utils/useLocales';
import moment from 'moment';
import 'moment/locale/es';
import { useNotification } from './lib/notification/notificationHooks';
import { LoadinModalProvider } from './context/loadinModalContext';
import { initRemoteConfig } from './lib/featureToggle';
import theme from './Theme/Theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const CustomFallback = () => (
  <View style={theme.flex1}>
    <ErrorScreen />
  </View>
);

// Error handler personalizado para Crashlytics
const errorHandler = (error, stackTrace) => {
  Logger.fatal('Error caught by boundary', error, {
    stackTrace: stackTrace?.substring(0, 500)
  });
};

// Verificar actualizaciones OTA (reemplazo de CodePush)
async function checkForUpdates() {
  if (__DEV__) return; // No verificar en desarrollo

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      Logger.info('OTA update available');
      Alert.alert(
        'Actualización disponible',
        'Hay una nueva versión de la aplicación. ¿Deseas actualizar ahora?',
        [
          { text: 'Más tarde', style: 'cancel' },
          {
            text: 'Actualizar',
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch (e) {
                Logger.error('Error applying OTA update', e);
              }
            }
          }
        ]
      );
    }
  } catch (e) {
    Logger.warn('Error checking for updates', { error: e.message });
  }
}

const App = () => {
  useNotification();
  const { locale } = useLocales();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Inicializar Crashlytics
        const crashlyticsInstance = getCrashlytics();
        await setCrashlyticsCollectionEnabled(crashlyticsInstance, true);

        // Agregar información del dispositivo
        crashSetAttribute(crashlyticsInstance, 'platform', Platform.OS);
        crashSetAttribute(
          crashlyticsInstance,
          'platform_version',
          String(Platform.Version)
        );
        crashLog(crashlyticsInstance, 'App initialized');

        Logger.info('App initialized', {
          platform: Platform.OS,
          version: Platform.Version
        });

        await initRemoteConfig();

        // Verificar actualizaciones OTA
        checkForUpdates();
      } catch (e) {
        Logger.error('Error during app initialization', e);
      } finally {
        setAppIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (locale) {
        moment.locale(locale);
      }
    };
    init();
  }, [locale]);

  useEffect(() => {
    const languages = {
      US: 'en',
      ES: 'es'
    };
    const regionCode = Localization.getLocales()[0]?.regionCode || 'US';
    i18n.changeLanguage(languages[regionCode] || 'en');
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Crear una instancia de QueryClient
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000 // Renamed from cacheTime in React Query v5
      }
    }
  });

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ErrorBoundary
          FallbackComponent={CustomFallback}
          onError={errorHandler}
        >
          <LoadinModalProvider>
            <Provider store={store}>
              <GestureHandlerRootView
                style={theme.flex1}
                onLayout={onLayoutRootView}
              >
                <AuthRouter />
              </GestureHandlerRootView>
              <Toast ref={ref => Toast.setRef(ref)} />
            </Provider>
          </LoadinModalProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
