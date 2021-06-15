import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen, {LOGIN_SCREEN_KEY} from '../Screens/Login/LoginScreen';

const Stack = createStackNavigator();

export default function SignOutRouter() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen name={LOGIN_SCREEN_KEY} component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
