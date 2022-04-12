import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  CHECK_STACK_KEY,
  HOME_WORKER_STACK_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY,
} from '../Router/utils/routerKeys';
import HomeWorker from './HomeWorker';
import {IncidenceScreen} from '../Screens/Incidence';
import {JobScreen} from '../Screens/Job';

import Check from './Check';

const {Navigator, Screen} = createNativeStackNavigator();

export const MainWorker = ({route}) => (
  <Navigator
    options={{headerShown: false}}
    screenOptions={{
      headerShown: false,
    }}>
    <Screen name={HOME_WORKER_STACK_KEY} component={HomeWorker} />
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
  </Navigator>
);
