import {createSlice} from '@reduxjs/toolkit';
import subDays from 'date-fns/subDays';

const initialState = {
  houses: [],
  checklists: {
    from: subDays(new Date(), 7),
    houses: [],
  },
  filterDate: new Date(),
  statusTaskFilter: false,
  statusIncidenceFilter: false,
  cacheHouses: [],
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    addHouse: (state, {payload}) => {
      state.houses = payload.houses;
    },
    setCacheHouses: (state, {payload}) => {
      state.cacheHouses = payload.houses;
    },
    setDate: (state, {payload}) => {
      state.filterDate = payload.date;
    },
    setFilterByType: (state, {payload}) => {
      state[payload.storage] = {
        ...state[payload.storage],
        [payload.type]: payload.value,
      };
    },
    setStatusTaskFilter: (state, {payload}) => {
      state.statusTaskFilter = payload;
    },
    setStatusIncidenceFilter: (state, {payload}) => {
      state.statusIncidenceFilter = payload;
    },
  },
});

// Selectors
export const housesSelector = (state) => state.filters.houses;
export const cacheHousesSelector = (state) => state.filters.cacheHouses;
export const checklistsSelector = (state) => state.filters.checklists;
export const filterDateSelector = (state) => state.filters.filterDate;
export const statusTaskFilterSelector = (state) =>
  state.filters.statusTaskFilter;
export const statusIncidenceFilterSelector = (state) =>
  state.filters.statusIncidenceFilter;

// Actions
export const {
  addHouse,
  setDate,
  setCacheHouses,
  setFilterByType,
  setStatusTaskFilter,
  setStatusIncidenceFilter,
} = filtersSlice.actions;

export default filtersSlice.reducer;
