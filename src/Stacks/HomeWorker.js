import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens

import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Platform} from 'react-native';

import {
  DASHBOARD_WORKER_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
  QUADRANT_SCREEN_KEY,
} from '../Router/utils/routerKeys';
import DashboardWorkerScreen from '../Screens/DashboardWorker/DashboardWorker';

import {ProfileScreen} from '../Screens/Profile';
import {tabNameByScreen} from '../utils/parsers';

import {useTranslation} from 'react-i18next';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from '../Theme/Variables';
import {useSelector} from 'react-redux';
import {userSelector} from '../Store/User/userSlice';
import {QuadrantScreen} from '../Screens/Quadrant';
import {isFeatureEnabled, REGISTRY} from '../lib/featureToggle';

const {Navigator, Screen} = createBottomTabNavigator();

const HomeWorker = () => {
  const {t} = useTranslation();
  const user = useSelector(userSelector);
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
    <Navigator
      options={{headerShown: false}}
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
      }}>
      <Screen
        name={t(tabNameByScreen[DASHBOARD_WORKER_SCREEN_KEY])}
        initialParams={{screenKey: DASHBOARD_WORKER_SCREEN_KEY}}
        component={DashboardWorkerScreen}
        options={({route}) => ({
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name={focused ? 'ios-speedometer' : 'ios-speedometer-outline'}
              size={25}
              focused={focused}
              color={Colors.pm}
            />
          ),
        })}
      />
      {isFeatureEnabled(REGISTRY.FEATURE_QUADRANT) && (
        <Screen
          name={t(tabNameByScreen[QUADRANT_SCREEN_KEY])}
          initialParams={{screenKey: QUADRANT_SCREEN_KEY}}
          component={QuadrantScreen}
          options={({route}) => ({
            tabBarVisible: getTabBarVisible(route),
            tabBarIcon: ({focused, color, size}) => (
              <>
                <Icon
                  name={focused ? 'grid' : 'grid-outline'}
                  size={25}
                  focused={focused}
                  color={Colors.pm}
                />
              </>
            ),
          })}
        />
      )}
      <Screen
        name={t(tabNameByScreen[PROFILE_SCREEN_KEY])}
        initialParams={{screenKey: PROFILE_SCREEN_KEY, userId: user?.id}}
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name={focused ? 'ios-person' : 'ios-person-outline'}
              size={25}
              focused={focused}
              color={Colors.pm}
            />
          ),
        }}
      />
    </Navigator>
  );
};

export default HomeWorker;
