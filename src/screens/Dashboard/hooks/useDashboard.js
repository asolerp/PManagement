import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback
} from 'react';
import { FiltersContext } from '../../../context/FiltersContext';
import { useWindowDimensions } from 'react-native';
import { useAnimatedContainer } from './useAnimatedContainer';
import moment from 'moment';
import { ChecklistsTab } from '../../../components/Dashboard/Tabs/ChecklistsTab';
import { IncidencesTab } from '../../../components/Dashboard/Tabs/IncidencesTab';
import Orientation from 'react-native-orientation-locker';
import { CHECKLISTS, INCIDENCES } from '../../../utils/firebaseKeys';

export const useDashboard = navigation => {
  const [index, setIndex] = useState(0);
  const { filters, setFilters } = useContext(FiltersContext);
  const { isScrollActive, gestureHandler, containerStyles } =
    useAnimatedContainer();

  const routes = useMemo(
    () => [
      { key: CHECKLISTS, title: 'Checklists' },
      { key: INCIDENCES, title: 'Incidencias' }
    ],
    []
  );

  const date = useMemo(() => {
    const dateArray = moment(new Date()).format('LL').split(' ');
    return [
      dateArray[0],
      dateArray[1],
      dateArray[2][0].toUpperCase() + dateArray[2].slice(1)
    ];
  }, []);

  const layout = useWindowDimensions();

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case CHECKLISTS:
          return (
            <ChecklistsTab filters={filters} scrollEnabled={isScrollActive} />
          );
        case INCIDENCES:
          return (
            <IncidencesTab filters={filters} scrollEnabled={isScrollActive} />
          );
        default:
          return null;
      }
    },
    [filters, isScrollActive]
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Orientation.unlockAllOrientations();
      Orientation.lockToPortrait();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  return {
    index,
    routes,
    layout,
    filters,
    date,
    setIndex,
    setFilters,
    renderScene,
    gestureHandler,
    containerStyles
  };
};
