import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {View, Text, StyleSheet} from 'react-native';

// Screens
import HomesStack from './HomesStack';
import JobsStack from './JobsStack';
import DashboardStack from './DashboardStack';

import {AnimatedTabBarNavigator} from 'react-native-animated-nav-tab-bar';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Platform} from 'react-native';
import IncidencesStack from './IncidencesStack';
import CheckListStack from './CheckListStack';
import {useGetDocFirebase} from '../hooks/useGetDocFIrebase';
import {PM_COLOR, PRIORITY_HEIGHT} from '../styles/colors';

const Tabs = AnimatedTabBarNavigator();

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: PRIORITY_HEIGHT,
    position: 'absolute',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    right: -10,
    top: -10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const IconWithBadge = ({badgeCount, children}) => {
  return (
    <View style={styles.container}>
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
      {children}
    </View>
  );
};

const TabNavigation = () => {
  const {document: incidencesCounter} = useGetDocFirebase(
    'incidences',
    'stats',
  );

  const getTabBarVisible = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route);
    if (
      routeName === 'NewJob' ||
      routeName === 'NewJobTaskSelector' ||
      routeName === 'JobScreen' ||
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
      <Tabs.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarBadge: 5,
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name="dashboard"
              size={size ? size : 24}
              color={focused ? color : PM_COLOR}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="CheckList"
        component={CheckListStack}
        options={{
          tabBarBadge: 3,
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name="check"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Trabajos"
        component={JobsStack}
        options={({route}) => ({
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name="format-list-bulleted"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
          ),
        })}
      />
      <Tabs.Screen
        name="Incidencias"
        component={IncidencesStack}
        options={({route}) => ({
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <IconWithBadge badgeCount={incidencesCounter?.count}>
              <Icon
                name="priority-high"
                size={size ? size : 24}
                color={focused ? color : '#3E93A8'}
                focused={focused}
              />
            </IconWithBadge>
          ),
        })}
      />
      <Tabs.Screen
        name="Casas"
        component={HomesStack}
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
    </Tabs.Navigator>
  );
};

export default TabNavigation;
