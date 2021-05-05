import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  job: {},
  house: {},
  workers: {},
  observations: '',
};

export const checkListSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {
    setForm: (state, {payload}) => {
      state[payload.label] = payload.value;
    },
    resetForm: (state) => {
      state.house = {};
      state.workers = {};
      state.observations = '';
    },
  },
});

// Selectors
export const houseSelector = (state) => state.checklist.house;
export const workersSelector = (state) => state.checklist.workers;
export const observationsSelector = (state) => state.checklist.observations;

export const {setForm, resetForm} = checkListSlice.actions;

export default checkListSlice.reducer;
