import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {CheckScreen, CHECK_SCREEN_KEY} from '../Screens/Check';
import CheckPhotosScreen, {
  CHECK_PHOTO_SCREEN_KEY,
} from '../Screens/CheckPhotos/CheckPhotosScreen';

const {Navigator, Screen} = createStackNavigator();

export const CHECK_STACK_KEY = 'checkStack';

const Check = ({route}) => {
  const {docId} = route.params;
  return (
    <Navigator
      options={{headerShown: false}}
      screenOptions={{
        headerShown: false,
      }}>
      <Screen
        name={CHECK_SCREEN_KEY}
        component={CheckScreen}
        initialParams={{docId}}
      />
      <Screen name={CHECK_PHOTO_SCREEN_KEY} component={CheckPhotosScreen} />
    </Navigator>
  );
};

export default Check;
