import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import JobsScreen from '../Screens/Jobs/JobsScreen';
import NewJobScreen from '../Screens/Jobs/NewJobScreen';
import NewJobTaskSelectorScreen from '../Screens/Jobs/NewJobTaskSelectorScreen';
import JobScreen from '../Screens/Jobs/JobScreen';

const Stack = createStackNavigator();

export default function JobsStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          cardStyle: {backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen name="NewJob" component={NewJobScreen} />
      <Stack.Screen
        name="NewJobTaskSelector"
        component={NewJobTaskSelectorScreen}
      />
      <Stack.Screen name="JobScreen" component={JobScreen} />
    </Stack.Navigator>
  );
}
