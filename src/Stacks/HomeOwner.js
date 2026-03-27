import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    >
      <Tabs.Screen
        name={t(tabNameByScreen[DASHBOARD_OWNER_SCREEN_KEY])}
        initialParams={{ screenKey: DASHBOARD_OWNER_SCREEN_KEY }}
        component={DashboardOwner}
      />
    </Tabs.Navigator>
  );
};

export default HomeOwner;
