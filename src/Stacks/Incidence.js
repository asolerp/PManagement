import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import IncidenceScreen,  from '../Screens/IncidenceScreen';
import { INCIDENCE_SCREEN_KEY } from '../Router/utils/routerKeys';

const {Navigator, Screen} = createStackNavigator();

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
