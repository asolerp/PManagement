import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  navigation as navigationRef,
  onNavigatorReady,
  onNavigatorStateChange
} from './utils/actions';

import { MainAdmin } from '../Stacks/MainAdmin';

import { NewCheckListScreen } from '../Screens/NewCheckList';
import NewJob from '../Stacks/NewJob';
import { NewIncidenceScreen } from '../Screens/NewIncidence';
import { NewHouseScreen } from '../Screens/NewHouse';
import {
  CHAT_SCREEN_KEY,
  MAIN_ADMIN_STACK_KEY,
  NEW_CHECKLIST_SCREEN,
  NEW_HOUSE_SCREEN_KEY,
  NEW_INCIDENCE_SCREEN_KEY,
  NEW_JOB_STACK_KEY,
  NEW_USER_SCREEN_KEY,
  PAGE_OPTIONS_SCREEN_KEY,
  TIME_TRACKING_SCREEN_KEY
} from './utils/routerKeys';
import { PageOptionsScreen } from '../Screens/PageOptions';
import { ChatScreen } from '../Screens/Chat';
import { NewUserScreen } from '../Screens/NewUser';
import { FiltersProvider } from '../context/FiltersContext';
import { NewQuadrantScreen } from '../Screens/NewQuadrant/NewQuadrantScreen';
import { NEW_QUADRANT_SCREEN_KEY } from '../Screens/NewQuadrant';
import { NEW_JOB_QUADRANT_SCREEN_KEY } from '../Screens/NewJobQuadrant';
import { NewJobQuadrantScreen } from '../Screens/NewJobQuadrant/NewJobQuadrantScreen';
import { TimeTrackingScreen } from '../Screens/TimeTracking';
import CrashlyticsTestScreen from '../Screens/CrashlyticsTest/CrashlyticsTestScreen';
import { CRASHLYTICS_TEST_SCREEN_KEY } from '../Screens/CrashlyticsTest';

const { Navigator, Screen } = createNativeStackNavigator();

const AdminRouter = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigatorReady}
      onStateChange={onNavigatorStateChange}
      options={{ headerShown: false }}
    >
      <Navigator options={{ headerShown: false }}>
        <Screen options={{ headerShown: false }} name={MAIN_ADMIN_STACK_KEY}>
          {() => (
            <FiltersProvider>
              <MainAdmin />
            </FiltersProvider>
          )}
        </Screen>
        <Screen
          name={NEW_CHECKLIST_SCREEN}
          component={NewCheckListScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={NEW_JOB_STACK_KEY}
          component={NewJob}
          options={{ headerShown: false }}
        />
        <Screen
          name={NEW_QUADRANT_SCREEN_KEY}
          component={NewQuadrantScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={NEW_JOB_QUADRANT_SCREEN_KEY}
          component={NewJobQuadrantScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={NEW_INCIDENCE_SCREEN_KEY}
          component={NewIncidenceScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={NEW_USER_SCREEN_KEY}
          component={NewUserScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={NEW_HOUSE_SCREEN_KEY}
          component={NewHouseScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={PAGE_OPTIONS_SCREEN_KEY}
          component={PageOptionsScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={CHAT_SCREEN_KEY}
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={TIME_TRACKING_SCREEN_KEY}
          component={TimeTrackingScreen}
          options={{ headerShown: false }}
        />
        <Screen
          name={CRASHLYTICS_TEST_SCREEN_KEY}
          component={CrashlyticsTestScreen}
          options={{ headerShown: false }}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default AdminRouter;
