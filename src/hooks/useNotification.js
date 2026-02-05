import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import {
  getMessaging,
  onNotificationOpenedApp,
  getInitialNotification
} from '@react-native-firebase/messaging';

const useNotification = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const messaging = getMessaging();
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    const unsubscribe = onNotificationOpenedApp(messaging, remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification
      );
      navigation.navigate(remoteMessage.data.screen, {
        docId: remoteMessage.data.docId
      });
    });

    // Check whether an initial notification is available
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification
        );
      }
    });

    return unsubscribe;
  }, []);
};

export default useNotification;
