import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen, {LOGIN_SCREEN_KEY} from '../Screens/Login/LoginScreen';

const Stack = createNativeStackNavigator();

export default function SignOutRouter() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none">
        <Stack.Screen
          name={LOGIN_SCREEN_KEY}
          component={LoginScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
