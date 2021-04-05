import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import DashboardScreen from '../screens/DashboardScreen';
import IncidenceScreen from '../screens/IncidenceScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Incidence" component={IncidenceScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
