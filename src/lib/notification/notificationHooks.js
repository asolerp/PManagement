import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {openScreenWithPush} from '../../Router/utils/actions';
import {
  CHAT_SCREEN_KEY,
  CHECK_STACK_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY,
  MAIN_ADMIN_STACK_KEY,
  MAIN_WORKER_STACK_KEY,
} from '../../Router/utils/routerKeys';
import {CHECKLISTS, INCIDENCES, JOBS} from '../../utils/firebaseKeys';
import useAuth from '../../utils/useAuth';

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
        if (type === 'entity') {
          if (collection === JOBS) {
            return openScreenWithPush(mainStack, {
              screen: JOB_SCREEN_KEY,
              ...data,
              notification: true,
            });
          }
          if (collection === INCIDENCES) {
            return openScreenWithPush(mainStack, {
              screen: INCIDENCE_SCREEN_KEY,
              ...data,
              notification: true,
            });
          }
          if (collection === CHECKLISTS) {
            return openScreenWithPush(mainStack, {
              screen: CHECK_STACK_KEY,
              ...data,
              notification: true,
            });
          }
        }

        if (type === 'chat') {
          openScreenWithPush(CHAT_SCREEN_KEY, {
            ...data,
            notification: true,
          });
        }
      }
    });
  }, []);
};
