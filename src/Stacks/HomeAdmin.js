import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {View, Text, StyleSheet} from 'react-native';

// Screens
import {DashboardScreen} from '../Screens/Dashboard';
import {HousesScreen} from '../Screens/Houses';

import {AnimatedTabBarNavigator} from 'react-native-animated-nav-tab-bar';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Platform} from 'react-native';

import {PM_COLOR, PRIORITY_HEIGHT} from '../styles/colors';

import {tabNameByScreen} from '../utils/parsers';
import {
  DASHBOARD_SCREEN_KEY,
  HOUSES_SCREEN_KEY,
  USERS_SCREEN_KEY,
} from '../Router/utils/routerKeys';
import {UsersScreen} from '../Screens/Users';
import {useTranslation} from 'react-i18next';
import {isIOS} from '../utils/platform';

const {Navigator, Screen} = AnimatedTabBarNavigator();

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
        headerShown: false,
      }}
      tabBarOptions={{
        activeTintColor: 'white',
        inactiveTintColor: 'white',
        activeBackgroundColor: PM_COLOR,
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
      <Screen
        name={t(tabNameByScreen[DASHBOARD_SCREEN_KEY])}
        initialParams={{screenKey: DASHBOARD_SCREEN_KEY}}
        component={DashboardScreen}
        options={({route}) => ({
          tabBarBadge: 5,
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name="dashboard"
              size={size ? size : 24}
              color={focused ? color : PM_COLOR}
              focused={focused}
            />
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
            <Icon
              name="person"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
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
            <Icon
              name="home"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
          ),
        })}
      />
    </Navigator>
  );
};

export default HomeAdmin;
