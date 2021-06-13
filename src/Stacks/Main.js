import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home, {HOME_STACK_KEY} from './Home';
import {ProfileScreen, PROFILE_SCREEN_KEY} from '../Screens/Profile';
import {JobScreen, JOB_SCREEN_KEY} from '../Screens/Job';
import {IncidenceScreen, INCIDENCE_SCREEN_KEY} from '../Screens/Incidence';

import Check, {CHECK_STACK_KEY} from './Check';
import {HouseScreen, HOUSE_SCREEN_KEY} from '../Screens/House';

const {Navigator, Screen} = createStackNavigator();
export const MAIN_STACK_KEY = 'main';

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
