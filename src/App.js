import React, {useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import AuthRouter from './Router/authRouter';
import {ModalPortal} from 'react-native-modals';
import i18n from 'i18next';

import ErrorBoundary from 'react-native-error-boundary';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {Provider} from 'react-redux';
import store from './Store';

import messaging from '@react-native-firebase/messaging';
import * as RNLocalize from 'react-native-localize';

import './Translations';

const CustomFallback = (props) => (
  <View>
    <Text>Something happened!</Text>
    <Text>{props.error.toString()}</Text>
    <Button onPress={props.resetError} title={'Try again'} />
  </View>
);

const App = () => {
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
      <Provider store={store}>
        <SafeAreaProvider>
          <AuthRouter />
          <ModalPortal />
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
