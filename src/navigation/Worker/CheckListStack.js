import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import NewCheckListJobScreen from '../Screens/CheckList/NewCheckListJobScreen';
import CheckSceen from '../Screens/CheckList/CheckScreen';
import CheckPhotosScreen from '../Screens/CheckList/CheckPhotosScreen';

const Stack = createStackNavigator();

export default function CheckListStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Check" component={CheckSceen} />
      <Stack.Screen name="CheckPhotos" component={CheckPhotosScreen} />
      <Stack.Screen name="NewCheckList" component={NewCheckListJobScreen} />
    </Stack.Navigator>
  );
}
