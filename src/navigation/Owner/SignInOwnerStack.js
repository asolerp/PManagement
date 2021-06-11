import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import TabNavigationOwner from './TabNavigationOwner';

export default function SignInOwnerStack() {
  return (
    <NavigationContainer>
      <TabNavigationOwner />
    </NavigationContainer>
  );
}
