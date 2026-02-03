import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens

import { AnimatedTabBarNavigator } from 'react-native-animated-nav-tab-bar';
import { Platform } from 'react-native';

import { DASHBOARD_OWNER_SCREEN_KEY } from '../Router/utils/routerKeys';
import { DashboardOwner } from '../Screens/DashboardOwner';
import { tabNameByScreen } from '../utils/parsers';
import { useTranslation } from 'react-i18next';

const Tabs = AnimatedTabBarNavigator();

const HomeOwner = () => {
  const { t } = useTranslation();

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
          borderTopColor: '#dbdbdb'
        }
      }}
      appearence={{
        floating: false,
        shadow: true,
        tabBarBackground: 'white'
      }}
    >
      <Tabs.Screen
        name={t(tabNameByScreen[DASHBOARD_OWNER_SCREEN_KEY])}
        initialParams={{ screenKey: DASHBOARD_OWNER_SCREEN_KEY }}
        component={DashboardOwner}
        options={{
          tabBarVisible: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name="dashboard"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
          )
        }}
      />
    </Tabs.Navigator>
  );
};

export default HomeOwner;
