import React from 'react';
import { useContext, useState, useMemo, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import moment from 'moment';

import { FiltersContext } from '../../../context/FiltersContext';
import { useAnimatedContainer } from './useAnimatedContainer';
import { ChecklistsTab } from '../../../components/Dashboard/Tabs/ChecklistsTab';
import { IncidencesTab } from '../../../components/Dashboard/Tabs/IncidencesTab';
import { CHECKLISTS, INCIDENCES } from '../../../utils/firebaseKeys';

export const useDashboard = () => {
  const [index, setIndex] = useState(0);
  const { filters, setFilters } = useContext(FiltersContext);
  const { isScrollActive, gestureHandler, containerStyles } =
    useAnimatedContainer();
  const layout = useWindowDimensions();

  const routes = useMemo(
    () => [
      { key: CHECKLISTS, title: 'Checklists' },
      { key: INCIDENCES, title: 'Incidencias' }
    ],
    []
  );

  const date = useMemo(() => {
    const formattedDate = moment().format('LL');
    const dateArray = formattedDate.split(' ');

    if (dateArray.length < 3) return dateArray;

    return [
      dateArray[0],
      dateArray[1],
      dateArray[2].charAt(0).toUpperCase() + dateArray[2].slice(1)
    ];
  }, []);

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
