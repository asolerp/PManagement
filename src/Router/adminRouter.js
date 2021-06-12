import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {
  navigation as navigationRef,
  onNavigatorReady,
  onNavigatorStateChange,
} from './utils/actions';

import {Main, MAIN_STACK_KEY} from '../Stacks/Main';

const {Navigator, Screen} = createStackNavigator();

const AdminRouter = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigatorReady}
      onStateChange={onNavigatorStateChange}
      options={{headerShown: false}}>
      <Navigator mode="modal" options={{headerShown: false}}>
        <Screen
          name={MAIN_STACK_KEY}
          component={Main}
          options={{headerShown: false}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default AdminRouter;
