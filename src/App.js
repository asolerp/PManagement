import React, {useEffect} from 'react';
import {View} from 'react-native';
import AuthRouter from './Router/authRouter';
import {ModalPortal} from 'react-native-modals';
import i18n from 'i18next';
import Toast from 'react-native-toast-message';
import {MenuProvider} from 'react-native-popup-menu';

import ErrorBoundary from 'react-native-error-boundary';

import {Provider} from 'react-redux';
import store from './Store';

import * as RNLocalize from 'react-native-localize';
import {init as initLogging} from './lib/logging';
import './Translations';

import {ErrorScreen} from './Screens/Error';
import {useLocales} from './utils/useLocales';
import moment from 'moment';
import {useNotification} from './lib/notification/notificationHooks';

const CustomFallback = (props) => (
  <View style={{flex: 1}}>
    <ErrorScreen />
  </View>
);

const App = () => {
  useNotification();
  const {locale} = useLocales();
  useEffect(() => {
    moment.locale(locale);
    initLogging();
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
        <Provider store={store}>
          <AuthRouter />
          <ModalPortal />
          <Toast ref={(ref) => Toast.setRef(ref)} />
        </Provider>
      </MenuProvider>
    </ErrorBoundary>
  );
};

export default App;
