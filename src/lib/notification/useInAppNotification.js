import {useEffect} from 'react';

import messaging from '@react-native-firebase/messaging';

import {info} from '../logging';
import {notificationRouteHandler} from './utils/notificationRouteHandler';
import useAuth from '../../utils/useAuth';
import {
  MAIN_ADMIN_STACK_KEY,
  MAIN_WORKER_STACK_KEY,
} from '../../Router/utils/routerKeys';

import {routeName} from '../../Router/utils/actions';

export const useInAppNotification = () => {
  const {isAdmin} = useAuth();

  const mainStack = isAdmin ? MAIN_ADMIN_STACK_KEY : MAIN_WORKER_STACK_KEY;
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const {current} = routeName;
      const {data} = remoteMessage;
      const {type, collection} = data;
      current !== 'chatScreen' &&
        info({
          message: remoteMessage?.notification?.body,
          asToast: true,
          onPress: () =>
            notificationRouteHandler({type, data, collection, mainStack}),
        });
    });

    return unsubscribe;
  }, []);
};
