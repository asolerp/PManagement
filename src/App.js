import React, {useEffect} from 'react';
import {View} from 'react-native';
import AuthRouter from './Router/authRouter';
import i18n from 'i18next';
import Toast from 'react-native-toast-message';
import {MenuProvider} from 'react-native-popup-menu';
import RNBootSplash from 'react-native-bootsplash';

import ErrorBoundary from 'react-native-error-boundary';

import {Provider} from 'react-redux';
import store from './Store';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import * as RNLocalize from 'react-native-localize';
import './Translations';

import {ErrorScreen} from './Screens/Error';
import {useLocales} from './utils/useLocales';
import moment from 'moment';
import {useNotification} from './lib/notification/notificationHooks';
import {LoadinModalProvider} from './context/loadinModalContext';
import {initRemoteConfig} from './lib/featureToggle';
import theme from './Theme/Theme';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const CustomFallback = (props) => (
  <View style={theme.flex1}>
    <ErrorScreen />
  </View>
);

const App = () => {

  useNotification();
  const {locale} = useLocales();

  useEffect(() => {
    (async () => {
      await initRemoteConfig();
    })();
  }, []);

  useEffect(() => {
    const init = async () => {
      moment.locale(locale);
    };
    init().finally(async () => {
      await RNBootSplash.hide({fade: false});
    });
  }, [locale]);

  useEffect(() => {
    const languages = {
      US: 'en',
      ES: 'es',
    };
    i18n.changeLanguage(languages[RNLocalize.getCountry()]);
  }, []);

  // Crear una instancia de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Deshabilita el refetch automático cuando la ventana gana foco
      staleTime: 5 * 60 * 1000, // Tiempo en milisegundos que una consulta se considerará "fresca"
      cacheTime: 10 * 60 * 1000, // Tiempo en milisegundos que una consulta inactiva se mantendrá en caché
    }
  }
});

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ErrorBoundary FallbackComponent={CustomFallback}>
          <MenuProvider>
            <LoadinModalProvider>
              <Provider store={store}>
                <GestureHandlerRootView style={[theme.flex1]}>
                  <AuthRouter />
                </GestureHandlerRootView>
                <Toast ref={(ref) => Toast.setRef(ref)} />
              </Provider>
            </LoadinModalProvider>
          </MenuProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
