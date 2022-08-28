import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/core';
import messaging from '@react-native-firebase/messaging';

const useNotification = () => {
  const navigation = useNavigation();
  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      navigation.navigate(remoteMessage.data.screen, {
        docId: remoteMessage.data.docId,
      });
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });
  }, []);
};

export default useNotification;
