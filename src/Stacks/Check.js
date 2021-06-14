import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import CheckPhotosScreen from '../Screens/CheckPhotos/CheckPhotosScreen';
import {
  CHECK_PHOTO_SCREEN_KEY,
  CHECK_SCREEN_KEY,
} from '../Router/utils/routerKeys';
import {CheckScreen} from '../Screens/Check';

const {Navigator, Screen} = createStackNavigator();

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
