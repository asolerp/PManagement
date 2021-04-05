import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import CheckListScreen from '../screens/CheckList/CheckListScreen';
import NewCheckListJobScreen from '../screens/CheckList/NewCheckListJobScreen';
import CheckSceen from '../screens/CheckList/CheckScreen';

const Stack = createStackNavigator();

export default function CheckListStack() {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen
        name="CheckList"
        component={CheckListScreen}
        options={{
          cardStyle: {backgroundColor: 'transparent'},
        }}
      />
      <Stack.Screen name="Check" component={CheckSceen} />
      <Stack.Screen name="NewCheckList" component={NewCheckListJobScreen} />
    </Stack.Navigator>
  );
}
