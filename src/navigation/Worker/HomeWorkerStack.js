import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';

import messaging from '@react-native-firebase/messaging';

import {createStackNavigator} from '@react-navigation/stack';
import HomeWorker from '../../screens/Worker/HomeWorker';
import JobScreen from '../../screens/Jobs/JobScreen';
import NewIncidence from '../../screens/Worker/NewIncidence';
import CheckScreen from '../../screens/CheckList/CheckScreen';

const Stack = createStackNavigator();
const HomeWorkerStack = () => {
  const navigation = useNavigation();
  const [initialRoute, setInitialRoute] = useState('Home');

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      console.log('navigate to ', remoteMessage.data.screen);
      navigation.navigate(remoteMessage.data.screen, {
        jobId: remoteMessage.data.jobId,
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
          setInitialRoute(remoteMessage.data.screen); // e.g. "Settings"
        }
      });
  }, []);

  return (
    <Stack.Navigator headerMode="none" initialRouteName={initialRoute}>
      <Stack.Screen name="Home" component={HomeWorker} />
      <Stack.Screen name="Check" component={CheckScreen} />
      <Stack.Screen name="JobScreen" component={JobScreen} />
      <Stack.Screen name="NewIncidence" component={NewIncidence} />
    </Stack.Navigator>
  );
};

export default HomeWorkerStack;
