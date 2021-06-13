import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  NewJobTaskSelectorScreen,
  NEW_JOB_TASK_SELECTOR_SCREEN_KEY,
} from '../Screens/NewJobTaskSelector';
import {NewJobScreen, NEW_JOB_SCREEN_KEY} from '../Screens/NewJob';

const {Navigator, Screen} = createStackNavigator();

export const NEW_JOB_STACK_KEY = 'newJobStack';

const NewJob = ({route}) => {
  const {docId} = route.params;
  return (
    <Navigator
      options={{headerShown: false}}
      screenOptions={{
        headerShown: false,
      }}>
      <Screen
        name={NEW_JOB_TASK_SELECTOR_SCREEN_KEY}
        component={NewJobTaskSelectorScreen}
        initialParams={{docId}}
      />
      <Screen name={NEW_JOB_SCREEN_KEY} component={NewJobScreen} />
    </Navigator>
  );
};

export default NewJob;
