import React, {useEffect} from 'react';
import AuthNavigator from './Navigation/AuthNavigator';
import {ModalPortal} from 'react-native-modals';

import {Provider} from 'react-redux';
import store from './Store';

import messaging from '@react-native-firebase/messaging';

const App = () => {
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
    <Provider store={store}>
      <AuthNavigator />
      <ModalPortal />
    </Provider>
  );
};

export default App;