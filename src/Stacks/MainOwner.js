import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  CHECK_STACK_KEY,
  HOME_OWNER_STACK_KEY,
} from '../Router/utils/routerKeys';
import HomeOwner from './HomeOwner';
import Check from './Check';

const {Navigator, Screen} = createNativeStackNavigator();

export const MainOwner = () => (
  <Navigator
    options={{headerShown: false}}
    screenOptions={{
      headerShown: false,
    }}>
    <Screen name={HOME_OWNER_STACK_KEY} component={HomeOwner} />
    <Screen name={CHECK_STACK_KEY} component={Check} />
  </Navigator>
);
