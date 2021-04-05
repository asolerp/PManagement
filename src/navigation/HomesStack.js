import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import HomesScreen from '../screens/Homes/HomesScreen';
import NewHomeScreen from '../screens/Homes/NewHomeScreen';
import HomeScreen from '../screens/Homes/HomeScreen';

const Stack = createStackNavigator();

export default function HomesStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen
        name="Homes"
        component={HomesScreen}
        options={{
          cardStyle: {backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen name="NewHome" component={NewHomeScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
}
