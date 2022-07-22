import {useEffect, useRef, useState} from 'react';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

import {info} from '../logging';
import {notificationRouteHandler} from './utils/notificationRouteHandler';
import useAuth from '../../utils/useAuth';
import {
  MAIN_ADMIN_STACK_KEY,
  MAIN_WORKER_STACK_KEY,
} from '../../Router/utils/routerKeys';

import {routeName} from '../../Router/utils/actions';
import {AppState} from 'react-native';

export const useInAppNotification = () => {
  const {isAdmin} = useAuth();

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const mainStack = isAdmin ? MAIN_ADMIN_STACK_KEY : MAIN_WORKER_STACK_KEY;
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async () => {});
    return unsubscribe;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        notifee.setBadgeCount(0);
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().setBackgroundMessageHandler(async () => {
      await notifee.incrementBadgeCount();
    });

    return unsubscribe;
  }, []);
};
