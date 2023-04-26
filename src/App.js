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

import * as RNLocalize from 'react-native-localize';
import './Translations';

import {ErrorScreen} from './Screens/Error';
import {useLocales} from './utils/useLocales';
import moment from 'moment';
import {useNotification} from './lib/notification/notificationHooks';
import {LoadinModalProvider} from './context/loadinModalContext';
import {initRemoteConfig} from './lib/featureToggle';
import theme from './Theme/Theme';

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
      await RNBootSplash.hide({fade: true});
    });
  }, [locale]);

  useEffect(() => {
    const languages = {
      US: 'en',
      ES: 'es',
    };
    i18n.changeLanguage(languages[RNLocalize.getCountry()]);
  }, []);

  return (
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
  );
};

export default App;
