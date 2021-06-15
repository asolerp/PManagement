import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {
  navigation as navigationRef,
  onNavigatorReady,
  onNavigatorStateChange,
} from './utils/actions';

import {Main, MainAdmin} from '../Stacks/MainAdmin';

import {NewCheckListScreen} from '../Screens/NewCheckList';
import NewJob from '../Stacks/NewJob';
import {NewIncidenceScreen} from '../Screens/NewIncidence';
import {NewHouseScreen} from '../Screens/NewHouse';
import {
  MAIN_ADMIN_STACK_KEY,
  NEW_CHECKLIST_SCREEN,
  NEW_HOUSE_SCREEN_KEY,
  NEW_INCIDENCE_SCREEN_KEY,
  NEW_JOB_STACK_KEY,
} from './utils/routerKeys';

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
          name={MAIN_ADMIN_STACK_KEY}
          component={MainAdmin}
          options={{headerShown: false}}
        />
        <Screen
          name={NEW_CHECKLIST_SCREEN}
          component={NewCheckListScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={NEW_JOB_STACK_KEY}
          component={NewJob}
          options={{headerShown: false}}
        />
        <Screen
          name={NEW_INCIDENCE_SCREEN_KEY}
          component={NewIncidenceScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={NEW_HOUSE_SCREEN_KEY}
          component={NewHouseScreen}
          options={{headerShown: false}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default AdminRouter;
