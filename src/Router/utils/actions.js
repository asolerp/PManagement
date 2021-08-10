import {StackActions} from '@react-navigation/native';
import {createRef} from 'react';

import {HOME_ADMIN_STACK_KEY} from './routerKeys';

// import {setCurrentScreen} from '~/lib/tracking';

export const navigation = createRef();
export const routeName = createRef();

export const popScreen = () => navigation.current?.dispatch(StackActions.pop());

export const openScreen = (screenId, options = {}) => {
  navigation.current?.dispatch(StackActions.replace(screenId, options));
};

export const openScreenWithPush = (screenId, options = {}, forcePushScreen) => {
  if (forcePushScreen) {
    const pushAction = StackActions.push(screenId, options);
    navigation.current?.dispatch(pushAction);
    return;
  }

  navigation.current?.navigate(screenId, options);
};

export const openStack = (stackId, screenId, options = {}) => {
  navigation.current?.navigate(stackId, {screen: screenId, params: options});
};

export const openStackWithReplace = (stackId, screenId, options = {}) => {
  navigation.current?.dispatch(
    StackActions.replace(stackId, {screen: screenId, params: options}),
  );
};

export const resetNavigator = (screenId) => {
  navigation.current?.navigate(screenId || HOME_ADMIN_STACK_KEY);
};

export const onNavigatorReady = () =>
  (routeName.current = navigation?.current?.getCurrentRoute().name);

export const onNavigatorStateChange = () => {
  const currentRouteName = navigation?.current?.getCurrentRoute().name;

  routeName.current = currentRouteName;
};
