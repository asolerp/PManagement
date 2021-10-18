import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import {AnimatedTabBarNavigator} from 'react-native-animated-nav-tab-bar';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Platform} from 'react-native';

import {
  DASHBOARD_WORKER_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
} from '../Router/utils/routerKeys';
import DashboardWorkerScreen from '../Screens/DashboardWorker/DashboardWorker';

import {ProfileScreen} from '../Screens/Profile';
import {tabNameByScreen} from '../utils/parsers';

import {useTranslation} from 'react-i18next';

const Tabs = AnimatedTabBarNavigator();

const HomeWorker = () => {
  const {t} = useTranslation();
  const getTabBarVisible = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route);
    if (
      routeName === 'NewJob' ||
      routeName === 'JobScreen' ||
      routeName === 'Check' ||
      routeName === 'NewIncidence' ||
      routeName === 'Incidence'
    ) {
      return false;
    }
    return true;
  };

  return (
    <Tabs.Navigator
      tabBarOptions={{
        activeTintColor: 'white',
        inactiveTintColor: 'white',
        activeBackgroundColor: '#3E93A8',
        tabStyle: {
          marginTop: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          borderTopWidth: 1,
          borderBottomWidth: 0,
          borderTopColor: '#dbdbdb',
        },
      }}
      appearence={{
        floating: false,
        shadow: true,
        tabBarBackground: 'white',
      }}>
      <Tabs.Screen
        name={t(tabNameByScreen[DASHBOARD_WORKER_SCREEN_KEY])}
        initialParams={{screenKey: DASHBOARD_WORKER_SCREEN_KEY}}
        component={DashboardWorkerScreen}
        options={({route}) => ({
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name="dashboard"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
          ),
        })}
      />
      <Tabs.Screen
        name={t(tabNameByScreen[PROFILE_SCREEN_KEY])}
        initialParams={{screenKey: PROFILE_SCREEN_KEY}}
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name="person"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

export default HomeWorker;
