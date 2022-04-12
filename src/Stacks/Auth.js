import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen, {LOGIN_SCREEN_KEY} from '../Screens/Login/LoginScreen';

const {Navigator, Screen} = createNativeStackNavigator();

const Auth = () => {
  return (
    <Navigator
      options={{headerShown: false}}
      screenOptions={{
        headerShown: false,
      }}>
      <Screen name={LOGIN_SCREEN_KEY} component={LoginScreen} />
    </Navigator>
  );
};

export default Auth;
