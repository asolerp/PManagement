import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import TabNavigation from './TabNavigation';

export default function SignInStack() {
  return (
    <NavigationContainer>
      <TabNavigation />
    </NavigationContainer>
  );
}
