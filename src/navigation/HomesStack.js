import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import HomesScreen from '../Screens/Homes/HomesScreen';
import NewHomeScreen from '../Screens/Homes/NewHomeScreen';
import HomeScreen from '../Screens/Homes/HomeScreen';

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
