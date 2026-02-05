import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

import { DASHBOARD_OWNER_SCREEN_KEY } from '../Router/utils/routerKeys';
import { DashboardOwner } from '../Screens/DashboardOwner';
import { tabNameByScreen } from '../utils/parsers';
import { useTranslation } from 'react-i18next';

const Tabs = createBottomTabNavigator();

const HomeOwner = () => {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#3E93A8',
        tabBarStyle: {
          marginTop: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          borderTopWidth: 1,
          borderBottomWidth: 0,
          borderTopColor: '#dbdbdb',
          backgroundColor: 'white'
        },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name={t(tabNameByScreen[DASHBOARD_OWNER_SCREEN_KEY])}
        initialParams={{ screenKey: DASHBOARD_OWNER_SCREEN_KEY }}
        component={DashboardOwner}
        options={{
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
