import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

import {View, Text, StyleSheet} from 'react-native';

// Screens
import {DashboardScreen} from '../Screens/Dashboard';
import {HousesScreen} from '../Screens/Houses';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

import {PRIORITY_HEIGHT} from '../styles/colors';

import {tabNameByScreen} from '../utils/parsers';
import {
  DASHBOARD_SCREEN_KEY,
  HOUSES_SCREEN_KEY,
  QUADRANT_SCREEN_KEY,
  USERS_SCREEN_KEY,
} from '../Router/utils/routerKeys';
import {UsersScreen} from '../Screens/Users';
import {useTranslation} from 'react-i18next';
import {isIOS} from '../utils/platform';
import {Colors} from '../Theme/Variables';
import {QuadrantScreen} from '../Screens/Quadrant';

const {Navigator, Screen} = createBottomTabNavigator();

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  children: {
    position: 'relative',
    zIndex: 10,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: PRIORITY_HEIGHT,
    position: 'absolute',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    right: isIOS ? -10 : 0,
    top: isIOS ? -10 : 0,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export const IconWithBadge = ({badgeCount, children}) => {
  return (
    <View style={styles.container}>
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
      <View style={styles.children}>{children}</View>
    </View>
  );
};

const HomeAdmin = () => {
  const {t} = useTranslation();

  const getTabBarVisible = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route);
    if (
      routeName === 'NewJob' ||
      routeName === 'NewJobTaskSelector' ||
      routeName === 'JobScreen' ||
      routeName === 'Incidence' ||
      routeName === 'Check' ||
      routeName === 'CheckPhotos' ||
      routeName === 'NewCheckList'
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
        name={t(tabNameByScreen[DASHBOARD_SCREEN_KEY])}
        initialParams={{screenKey: DASHBOARD_SCREEN_KEY}}
        component={DashboardScreen}
        options={({route}) => ({
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <>
              <Icon
                name={focused ? 'ios-speedometer' : 'ios-speedometer-outline'}
                size={25}
                focused={focused}
                color={Colors.pm}
              />
            </>
          ),
        })}
      />
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
      <Screen
        name={t(tabNameByScreen[USERS_SCREEN_KEY])}
        initialParams={{screenKey: USERS_SCREEN_KEY}}
        component={UsersScreen}
        options={({route}) => ({
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <>
              <Icon
                name={focused ? 'ios-person' : 'ios-person-outline'}
                size={25}
                focused={focused}
                color={Colors.pm}
              />
            </>
          ),
        })}
      />
      <Screen
        name={t(tabNameByScreen[HOUSES_SCREEN_KEY])}
        initialParams={{screenKey: HOUSES_SCREEN_KEY}}
        component={HousesScreen}
        options={({route}) => ({
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <>
              <Icon
                name={focused ? 'ios-home' : 'ios-home-outline'}
                size={25}
                focused={focused}
                color={Colors.pm}
              />
            </>
          ),
        })}
      />
    </Navigator>
  );
};

export default HomeAdmin;
