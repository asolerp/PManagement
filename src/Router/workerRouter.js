import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {
  navigation as navigationRef,
  onNavigatorReady,
  onNavigatorStateChange,
} from './utils/actions';

import {
  MAIN_WORKER_STACK_KEY,
  NEW_INCIDENCE_SCREEN_KEY,
} from './utils/routerKeys';
import {MainWorker} from '../Stacks/MainWorker';
import {NewIncidenceScreen} from '../Screens/NewIncidence';

const {Navigator, Screen} = createStackNavigator();

const WorkerRouter = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigatorReady}
      onStateChange={onNavigatorStateChange}
      options={{headerShown: false}}>
      <Navigator mode="modal" options={{headerShown: false}}>
        <Screen
          name={MAIN_WORKER_STACK_KEY}
          component={MainWorker}
          options={{headerShown: false}}
        />
        <Screen
          name={NEW_INCIDENCE_SCREEN_KEY}
          component={NewIncidenceScreen}
          options={{headerShown: false}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default WorkerRouter;
