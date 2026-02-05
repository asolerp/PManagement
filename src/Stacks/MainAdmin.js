import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../Screens/Profile';
import { JobScreen } from '../Screens/Job';
import { IncidenceScreen } from '../Screens/Incidence';

import Check from './Check';
import { HouseScreen } from '../Screens/House';
import { CheckPhotosScreen } from '../Screens/CheckPhotos';
import {
  CHECK_PHOTO_SCREEN_KEY,
  CHECK_STACK_KEY,
  ENTRANCE_DETAIL_SCREEN_KEY,
  FILTERS_SCREEN_KEY,
  HOME_ADMIN_STACK_KEY,
  HOUSE_SCREEN_KEY,
  INCIDENCE_SCREEN_KEY,
  JOB_SCREEN_KEY,
  PROFILE_SCREEN_KEY,
  RECYCLE_BIN_SCREEN_KEY,
  TIME_TRACKING_SCREEN_KEY
} from '../Router/utils/routerKeys';
import HomeAdmin from './HomeAdmin';
import { FiltersScreen } from '../Screens/Filters';
import { RecycleBinScreen } from '../Screens/RecycleBin';
import EntranceDetailScreen from '../Screens/EntrancesManager/EntranceDetailScreen';
import { TimeTrackingScreen } from '../Screens/TimeTracking';

const { Navigator, Screen, Group } = createNativeStackNavigator();

export const MainAdmin = ({ route }) => {
  return (
    <Navigator
      options={{ headerShown: false }}
      screenOptions={{
        headerShown: false
      }}
    >
      <Screen name={HOME_ADMIN_STACK_KEY} component={HomeAdmin} />
      <Screen name={RECYCLE_BIN_SCREEN_KEY} component={RecycleBinScreen} />
      <Screen name={PROFILE_SCREEN_KEY} component={ProfileScreen} />
      <Screen
        name={JOB_SCREEN_KEY}
        component={JobScreen}
        initialParams={{
          jobId: route?.params?.docId
        }}
      />
      <Screen
        name={INCIDENCE_SCREEN_KEY}
        component={IncidenceScreen}
        initialParams={{
          incidenceId: route?.params?.docId
        }}
      />
      <Screen
        name={CHECK_STACK_KEY}
        component={Check}
        initialParams={{
          docId: route?.params?.docId
        }}
      />
      <Screen name={HOUSE_SCREEN_KEY} component={HouseScreen} />
      <Screen name={CHECK_PHOTO_SCREEN_KEY} component={CheckPhotosScreen} />
      <Screen
        name={ENTRANCE_DETAIL_SCREEN_KEY}
        component={EntranceDetailScreen}
      />
      <Screen name={TIME_TRACKING_SCREEN_KEY} component={TimeTrackingScreen} />
      <Group screenOptions={{ presentation: 'modal' }}>
        <Screen name={FILTERS_SCREEN_KEY} component={FiltersScreen} />
      </Group>
    </Navigator>
  );
};
