import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './Home';
import {ProfileScreen} from '../Screens/Profile';
import {JobScreen} from '../Screens/Job';
import {IncidenceScreen} from '../Screens/Incidence';

import Check from './Check';
import {HouseScreen} from '../Screens/House';
import {
  CHECK_STACK_KEY,
  HOME_STACK_KEY,
  HOUSE_SCREEN_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
} from '../Router/utils/routerKeys';

const {Navigator, Screen} = createStackNavigator();

export const Main = () => (
  <Navigator
    options={{headerShown: false}}
    screenOptions={{
      headerShown: false,
    }}>
    <Screen name={HOME_STACK_KEY} component={Home} />
    <Screen name={PROFILE_SCREEN_KEY} component={ProfileScreen} />
    <Screen name={JOB_SCREEN_KEY} component={JobScreen} />
    <Screen name={INCIDENCE_SCREEN_KEY} component={IncidenceScreen} />
    <Screen name={CHECK_STACK_KEY} component={Check} />
    <Screen name={HOUSE_SCREEN_KEY} component={HouseScreen} />
  </Navigator>
);
