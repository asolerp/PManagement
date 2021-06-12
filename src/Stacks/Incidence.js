import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import IncidenceScreen, {
  INCIDENCE_SCREEN_KEY,
} from '../Screens/IncidenceScreen';

const {Navigator, Screen} = createStackNavigator();

export const INCIDENCE_STAK_KEY = 'incidenceStack';

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
