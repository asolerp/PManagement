import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Home, {HOME_STACK_KEY} from './Home';
import {ProfileScreen, PROFILE_SCREEN_KEY} from '../Screens/Profile';

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
  </Navigator>
);
