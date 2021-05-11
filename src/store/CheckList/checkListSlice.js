import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  job: {},
  house: {},
  workers: {},
  observations: '',
  checks: {},
};

export const checkListSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {
    setForm: (state, {payload}) => {
      state[payload.label] = payload.value;
    },
    setCheck: (state, {payload}) => {
      state.checks[payload.check.id] = {
        ...payload.check,
        check: payload.checkState,
      };
    },
    setAllChecks: (state, {payload}) => {
      state.checks = payload.checks;
    },
    resetForm: (state) => {
      state.house = {};
      state.workers = {};
      state.checks = {};
      state.observations = '';
    },
  },
});

// Selectors
export const houseSelector = (state) => state.checklist.house;
export const workersSelector = (state) => state.checklist.workers;
export const observationsSelector = (state) => state.checklist.observations;
export const checksSelector = (state) => state.checklist.checks;

export const {
  setForm,
  resetForm,
  setCheck,
  setAllChecks,
} = checkListSlice.actions;

export default checkListSlice.reducer;
