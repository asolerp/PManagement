import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {View, Text, StyleSheet} from 'react-native';

// Screens
import {DashboardScreen, DASHBOARD_SCREEN_KEY} from '../Screens/Dashboard';
import {CheckListScreen, CHECKLIST_SCREEN_KEY} from '../Screens/Checklists';
import {JobsScreen, JOBS_SCREEN_KEY} from '../Screens/Jobs';
import {IncidencesScreen, INCIDENCES_SCREEN_KEY} from '../Screens/Incidences';
import {HousesScreen, HOUSES_SCREEN_KEY} from '../Screens/Houses';

import {AnimatedTabBarNavigator} from 'react-native-animated-nav-tab-bar';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Platform} from 'react-native';

import {PM_COLOR, PRIORITY_HEIGHT} from '../styles/colors';

import firestore from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';
import {tabNameByScreen} from '../utils/parsers';

const {Navigator, Screen} = AnimatedTabBarNavigator();

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

export const HOME_STACK_KEY = 'homeStack';

const Home = () => {
  const [incidencesCounter] = useDocumentData(
    firestore().collection('incidences').doc('stats'),
  );

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
      {/* <Screen
        name={tabNameByScreen[DASHBOARD_SCREEN_KEY]}
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
      /> */}
      <Screen
        name={tabNameByScreen[CHECKLIST_SCREEN_KEY]}
        initialParams={{screenKey: CHECKLIST_SCREEN_KEY}}
        component={CheckListScreen}
        options={({route}) => ({
          tabBarBadge: 3,
          tabBarVisible: getTabBarVisible(route),
          tabBarIcon: ({focused, color, size}) => (
            <Icon
              name="check"
              size={size ? size : 24}
              color={focused ? color : '#3E93A8'}
              focused={focused}
            />
          ),
        })}
      />
      <Screen
        name={tabNameByScreen[JOBS_SCREEN_KEY]}
        initialParams={{screenKey: JOBS_SCREEN_KEY}}
        component={JobsScreen}
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
      <Screen
        name={tabNameByScreen[INCIDENCES_SCREEN_KEY]}
        initialParams={{screenKey: INCIDENCES_SCREEN_KEY}}
        component={IncidencesScreen}
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
      <Screen
        name={tabNameByScreen[HOUSES_SCREEN_KEY]}
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

export default Home;
