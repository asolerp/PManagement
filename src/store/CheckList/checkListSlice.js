import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  job: {},
  house: {},
  workers: {},
  observations: 'hola',
};

export const checkListSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {
    setForm: (state, {payload}) => {
      state[payload.label] = payload.value;
    },
    resetForm: (state) => {
      state.checkList = {};
    },
  },
});

// Selectors
export const houseNewChecklistSelector = (state) => state.checklist.house;
export const workersNewCheckListSelector = (state) => state.checklist.workers;
export const observationsNewChecklistSelector = (state) =>
  state.checklist.observations;

export const {setForm, resetForm} = checkListSlice.actions;

export default checkListSlice.reducer;
