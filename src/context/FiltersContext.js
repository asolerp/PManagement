import React from 'react';
import {useState} from 'react';

import {createContext} from 'react';
import {parseTimeFilter} from '../utils/parsers';

export const FiltersContext = createContext();

export const FiltersProvider = ({children}) => {
  const [filters, setFilters] = useState({
    time: parseTimeFilter('all'),
    state: false,
    checklistState: false,
    type: ['jobs', 'incidences', 'checklists'],
  });

  const value = {
    filters,
    setFilters,
  };

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};
