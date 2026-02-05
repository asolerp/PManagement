import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {
  navigation as navigationRef,
  onNavigatorReady,
  onNavigatorStateChange,
} from './utils/actions';

import {
  CHECK_PHOTO_SCREEN_KEY,
  MAIN_OWNER_STACK_KEY,
  TIME_TRACKING_SCREEN_KEY,
} from './utils/routerKeys';

import {MainOwner} from '../Stacks/MainOwner';
import {CheckPhotosScreen} from '../Screens/CheckPhotos';
import {TimeTrackingScreen} from '../Screens/TimeTracking';

const {Navigator, Screen} = createNativeStackNavigator();

const OwnerRouter = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigatorReady}
      onStateChange={onNavigatorStateChange}
      options={{headerShown: false}}>
      <Navigator mode="modal" options={{headerShown: false}}>
        <Screen
          name={MAIN_OWNER_STACK_KEY}
          component={MainOwner}
          options={{headerShown: false}}
        />
        <Screen
          name={TIME_TRACKING_SCREEN_KEY}
          component={TimeTrackingScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={CHECK_PHOTO_SCREEN_KEY}
          component={CheckPhotosScreen}
          options={{headerShown: false}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default OwnerRouter;
