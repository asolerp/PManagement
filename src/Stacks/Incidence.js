import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import IncidenceScreen from '../Screens/IncidenceScreen';
import {INCIDENCE_SCREEN_KEY} from '../Router/utils/routerKeys';

const {Navigator, Screen} = createNativeStackNavigator();

const Incidence = () => {
  return (
    <Navigator
      options={{headerShown: false}}
      screenOptions={{
        headerShown: false,
      }}>
      <Screen name={INCIDENCE_SCREEN_KEY} component={IncidenceScreen} />
    </Navigator>
  );
};

export default Incidence;
