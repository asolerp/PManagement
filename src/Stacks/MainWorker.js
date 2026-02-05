import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  CHECK_PHOTO_SCREEN_KEY,
  CHECK_STACK_KEY,
  CONFIRM_ENTRANCE_SCREEN_KEY,
  HOME_WORKER_STACK_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
} from '../Router/utils/routerKeys';
import HomeWorker from './HomeWorker';
import {IncidenceScreen} from '../Screens/Incidence';
import {JobScreen} from '../Screens/Job';

import Check from './Check';
import {ProfileScreen} from '../Screens/Profile';
import {ConfirmEntranceScreen} from '../Screens/ConfirmEntrance';
import {CheckPhotosScreen} from '../Screens/CheckPhotos';

const {Navigator, Screen} = createNativeStackNavigator();

export const MainWorker = ({route}) => (
  <Navigator
    options={{headerShown: false}}
    screenOptions={{
      headerShown: false,
    }}>
    <Screen name={HOME_WORKER_STACK_KEY} component={HomeWorker} />
    <Screen
      name={CONFIRM_ENTRANCE_SCREEN_KEY}
      component={ConfirmEntranceScreen}
    />
    <Screen name={PROFILE_SCREEN_KEY} component={ProfileScreen} />

    <Screen
      name={JOB_SCREEN_KEY}
      component={JobScreen}
      initialParams={{
        jobId: route?.params?.docId,
      }}
    />
    <Screen
      name={INCIDENCE_SCREEN_KEY}
      component={IncidenceScreen}
      initialParams={{
        incidenceId: route?.params?.docId,
      }}
    />
    <Screen
      name={CHECK_STACK_KEY}
      component={Check}
      initialParams={{
        docId: route?.params?.docId,
      }}
    />
    <Screen name={CHECK_PHOTO_SCREEN_KEY} component={CheckPhotosScreen} />
  </Navigator>
);
