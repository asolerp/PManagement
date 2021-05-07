import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import IncidencesListScreen from '../Screens/IncidencesListScreen';
import IncidenceScreen from '../Screens/IncidenceScreen';

const Stack = createStackNavigator();

export default function IncidencesStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Incidencias" component={IncidencesListScreen} />
      <Stack.Screen name="Incidence" component={IncidenceScreen} />
    </Stack.Navigator>
  );
}
