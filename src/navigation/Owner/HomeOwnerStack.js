import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import JobScreen from '../../Screens/Jobs/JobScreen';
import NewIncidence from '../../Screens/Worker/NewIncidence';
import CheckScreen from '../../Screens/CheckList/CheckScreen';
import CheckPhotosScreen from '../../Screens/CheckList/CheckPhotosScreen';
import HomeOwner from '../../Screens/Owner/HomeOwner';

const Stack = createStackNavigator();
const HomeWorkerStack = () => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Home" component={HomeOwner} />
      <Stack.Screen name="Check" component={CheckScreen} />
      <Stack.Screen name="CheckPhotos" component={CheckPhotosScreen} />
      <Stack.Screen name="JobScreen" component={JobScreen} />
      <Stack.Screen name="NewIncidence" component={NewIncidence} />
    </Stack.Navigator>
  );
};

export default HomeWorkerStack;
