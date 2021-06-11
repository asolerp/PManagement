import React, {useState, useEffect} from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import DashboardScreen from '../Screens/Admin/DashboardScreen';
import IncidenceScreen from '../Screens/IncidenceScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import CheckScreen from '../Screens/CheckList/CheckScreen';
import CheckPhotosScreen from '../Screens/CheckList/CheckPhotosScreen';

import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();

export default function DashboardStack() {
  const [initialRoute, setInitialRoute] = useState('Dashboard');

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      console.log(
        'navigate to ',
        remoteMessage.data.screen,
        remoteMessage.data.docId,
      );
      // navigation.navigate(remoteMessage.data.screen, {
      //   docId: remoteMessage.data.docId,
      // });
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
          setInitialRoute(remoteMessage.data.screen); // e.g. "Settings"
        }
      });
  }, []);

  return (
    <Stack.Navigator headerMode="none" initialRouteName={initialRoute}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Incidence" component={IncidenceScreen} />
      <Stack.Screen name="Check" component={CheckScreen} />
      <Stack.Screen name="CheckPhotos" component={CheckPhotosScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
