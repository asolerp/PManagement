import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

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

const {Navigator, Screen} = createStackNavigator();

export const MainWorker = () => (
  <Navigator
    options={{headerShown: false}}
    screenOptions={{
      headerShown: false,
    }}>
    <Screen name={HOME_WORKER_STACK_KEY} component={HomeWorker} />
    <Screen name={INCIDENCE_SCREEN_KEY} component={IncidenceScreen} />
    <Screen name={JOB_SCREEN_KEY} component={JobScreen} />

    <Screen name={CHECK_STACK_KEY} component={Check} />
  </Navigator>
);
