import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {
  navigation as navigationRef,
  onNavigatorReady,
  onNavigatorStateChange,
} from './utils/actions';

import {
  CHAT_SCREEN_KEY,
  CHECK_PHOTO_SCREEN_KEY,
  CHECK_SCREEN_KEY,
  HOUSE_SCREEN_KEY,
  MAIN_WORKER_STACK_KEY,
  NEW_CHECKLIST_SCREEN,
  NEW_INCIDENCE_SCREEN_KEY,
  PAGE_OPTIONS_SCREEN_KEY,
} from './utils/routerKeys';
import {MainWorker} from '../Stacks/MainWorker';
import {NewIncidenceScreen} from '../Screens/NewIncidence';
import {ChatScreen} from '../Screens/Chat';
import {CheckScreen} from '../Screens/Check';
import {CheckPhotosScreen} from '../Screens/CheckPhotos';
import {PageOptionsScreen} from '../Screens/PageOptions';
import {NewCheckListScreen} from '../Screens/NewCheckList';
import {HouseScreen} from '../Screens/House';
import {FiltersProvider} from '../context/FiltersContext';

const {Navigator, Screen} = createNativeStackNavigator();

const WorkerRouter = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigatorReady}
      onStateChange={onNavigatorStateChange}
      options={{headerShown: false}}>
      <Navigator mode="modal" options={{headerShown: false}}>
        <Screen options={{headerShown: false}} name={MAIN_WORKER_STACK_KEY}>
          {() => (
            <FiltersProvider>
              <MainWorker />
            </FiltersProvider>
          )}
        </Screen>
        <Screen
          name={NEW_INCIDENCE_SCREEN_KEY}
          component={NewIncidenceScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={CHECK_SCREEN_KEY}
          component={CheckScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={CHECK_PHOTO_SCREEN_KEY}
          component={CheckPhotosScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={PAGE_OPTIONS_SCREEN_KEY}
          component={PageOptionsScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={NEW_CHECKLIST_SCREEN}
          component={NewCheckListScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={HOUSE_SCREEN_KEY}
          component={HouseScreen}
          options={{headerShown: false}}
        />
        <Screen
          name={CHAT_SCREEN_KEY}
          component={ChatScreen}
          options={{headerShown: false}}
        />
      </Navigator>
    </NavigationContainer>
  );
};

export default WorkerRouter;
