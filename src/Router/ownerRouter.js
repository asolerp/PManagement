import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {
  navigation as navigationRef,
  onNavigatorReady,
  onNavigatorStateChange,
} from './utils/actions';

import {MAIN_OWNER_STACK_KEY} from './utils/routerKeys';

import {MainOwner} from '../Stacks/MainOwner';

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
      </Navigator>
    </NavigationContainer>
  );
};

export default OwnerRouter;
