import React from 'react';
import { useContext, useMemo } from 'react';
import moment from 'moment';

import { FiltersContext } from '../../../context/FiltersContext';
import { useAnimatedContainer } from './useAnimatedContainer';
import { ChecklistsTab } from '../../../components/Dashboard/Tabs/ChecklistsTab';
import { CHECKLISTS } from '../../../utils/firebaseKeys';

export const useDashboard = () => {
  const { filters, setFilters } = useContext(FiltersContext);
  const { isScrollActive, gestureHandler, containerStyles } =
    useAnimatedContainer();

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

  const renderChecklistsContent = useMemo(
    () => <ChecklistsTab filters={filters} scrollEnabled={isScrollActive} />,
    [filters, isScrollActive]
  );

  return {
    filters,
    date,
    setFilters,
    renderChecklistsContent,
    gestureHandler,
    containerStyles
  };
};
