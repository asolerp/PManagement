import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';

import {
  MAIN_ADMIN_STACK_KEY,
  MAIN_WORKER_STACK_KEY,
} from '../../Router/utils/routerKeys';

import useAuth from '../../utils/useAuth';
import {notificationRouteHandler} from './utils/notificationRouteHandler';

export const useNotification = () => {
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
};

export const useRedirectNotification = () => {
  const {isAdmin} = useAuth();

  const mainStack = isAdmin ? MAIN_ADMIN_STACK_KEY : MAIN_WORKER_STACK_KEY;
  useEffect(() => {
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      if (remoteMessage) {
        const {data} = remoteMessage;
        const {type, collection} = data;
        notificationRouteHandler({type, data, collection, mainStack});
      }
    });
  }, []);
};
