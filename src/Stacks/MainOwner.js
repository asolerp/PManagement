import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  CHECK_STACK_KEY,
  ENTRANCES_MANAGER_SCREEN_KEY,
  ENTRANCE_DETAIL_SCREEN_KEY,
  HOME_OWNER_STACK_KEY
} from '../Router/utils/routerKeys';
import HomeOwner from './HomeOwner';
import Check from './Check';
import { EntrancesManager } from '../Screens/EntrancesManager';
import EntranceDetailScreen from '../Screens/EntrancesManager/EntranceDetailScreen';

const { Navigator, Screen } = createNativeStackNavigator();

export const MainOwner = () => (
  <Navigator
    options={{ headerShown: false }}
    screenOptions={{
      headerShown: false
    }}
  >
    <Screen name={HOME_OWNER_STACK_KEY} component={HomeOwner} />
    <Screen name={CHECK_STACK_KEY} component={Check} />
    <Screen name={ENTRANCES_MANAGER_SCREEN_KEY} component={EntrancesManager} />
    <Screen
      name={ENTRANCE_DETAIL_SCREEN_KEY}
      component={EntranceDetailScreen}
    />
  </Navigator>
);
