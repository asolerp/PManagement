import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {NewJobTaskSelectorScreen} from '../Screens/NewJobTaskSelector';
import {NewJobScreen} from '../Screens/NewJob';
import {
  NEW_JOB_SCREEN_KEY,
  NEW_JOB_TASK_SELECTOR_SCREEN_KEY,
} from '../Router/utils/routerKeys';

const {Navigator, Screen} = createStackNavigator();

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
