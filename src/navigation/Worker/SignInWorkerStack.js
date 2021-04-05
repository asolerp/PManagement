import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import TabNavigationWorker from './TabNavigationWorker';

export default function SignInWorkerStack() {
  return (
    <NavigationContainer>
      <TabNavigationWorker />
    </NavigationContainer>
  );
}
