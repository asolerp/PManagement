import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import HomeWorker from '../../Screens/Worker/HomeWorker';
import CheckScreen from '../../Screens/CheckList/CheckScreen';
import NewCheckListJobScreen from '../../Screens/CheckList/NewCheckListJobScreen';
import CheckPhotosScreen from '../../Screens/CheckList/CheckPhotosScreen';
import NewIncidence from '../../Screens/Worker/NewIncidence';

const Stack = createStackNavigator();
const HomeOwnerStack = () => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Home" component={HomeWorker} />
      <Stack.Screen name="Check" component={CheckScreen} />
      <Stack.Screen name="CheckPhotos" component={CheckPhotosScreen} />
      <Stack.Screen name="NewCheckList" component={NewCheckListJobScreen} />
      <Stack.Screen name="NewIncidence" component={NewIncidence} />
    </Stack.Navigator>
  );
};

export default HomeOwnerStack;
