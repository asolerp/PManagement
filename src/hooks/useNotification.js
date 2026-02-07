import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import {
  getMessaging,
  onNotificationOpenedApp,
  getInitialNotification
} from '@react-native-firebase/messaging';
import { Logger } from '../lib/logging';

const useNotification = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const messaging = getMessaging();
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    const unsubscribe = onNotificationOpenedApp(messaging, remoteMessage => {
      Logger.info('Notification caused app to open from background state', {
        screen: remoteMessage.data?.screen,
        docId: remoteMessage.data?.docId,
        notification: remoteMessage.notification
      });
      navigation.navigate(remoteMessage.data.screen, {
        docId: remoteMessage.data.docId
      });
    });

    // Check whether an initial notification is available
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        Logger.info('Notification caused app to open from quit state', {
          screen: remoteMessage.data?.screen,
          docId: remoteMessage.data?.docId,
          notification: remoteMessage.notification
        });
      }
    });

    return unsubscribe;
  }, []);
};

export default useNotification;
