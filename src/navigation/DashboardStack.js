import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import DashboardScreen from '../Screens/Admin/DashboardScreen';
import IncidenceScreen from '../Screens/IncidenceScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import CheckScreen from '../Screens/CheckList/CheckScreen';
import CheckPhotosScreen from '../Screens/CheckList/CheckPhotosScreen';

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Incidence" component={IncidenceScreen} />
      <Stack.Screen name="Check" component={CheckScreen} />
      <Stack.Screen name="CheckPhotos" component={CheckPhotosScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
