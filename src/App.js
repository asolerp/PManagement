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

import messaging from '@react-native-firebase/messaging';
import * as RNLocalize from 'react-native-localize';

import './Translations';
import {openScreenWithPush} from './Router/utils/actions';
import {CHAT_SCREEN_KEY, CHECK_SCREEN_KEY} from './Router/utils/routerKeys';
import {ErrorScreen} from './Screens/Error';

const CustomFallback = (props) => (
  <View style={{flex: 1}}>
    <ErrorScreen />
  </View>
);

const App = () => {
  useEffect(() => {
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      if (remoteMessage) {
        const {
          data: {type, collection, docId},
        } = remoteMessage;

        if (type === 'entity') {
          openScreenWithPush(CHECK_SCREEN_KEY, {
            docId,
          });
        }

        if (type === 'chat') {
          openScreenWithPush(CHAT_SCREEN_KEY, {
            collection,
            docId,
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    const languages = {
      US: 'en',
      ES: 'es',
    };
    i18n.changeLanguage(languages[RNLocalize.getCountry()]);
  }, []);

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    }
    requestUserPermission();
    return () => {
      requestUserPermission();
    };
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
