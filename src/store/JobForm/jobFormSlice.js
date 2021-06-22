import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  task: undefined,
  house: undefined,
  workers: undefined,
  observations: undefined,
  date: undefined,
};

const jobFormSlice = createSlice({
  name: 'jobForm',
  initialState,
  reducers: {
    setForm: (state, {payload}) => {
      state[payload.label] = payload.value;
    },
    setTask: (state, {payload}) => {
      state.task = payload.task;
    },
    resetForm: (state) => {
      state.task = undefined;
      state.house = undefined;
      state.workers = undefined;
      state.observations = undefined;
      state.date = undefined;
    },
  },
});

// Selectors
export const jobSelector = (state) => state.jobForm;
export const houseSelector = (state) => state.jobForm?.house;
export const workersSelector = (state) => state.jobForm?.workers;
export const observationsSelector = (state) => state.jobForm?.observations;
export const dateSelector = (state) => state.jobForm?.date;

// Actions
export const {setForm, setTask, editForm, resetForm} = jobFormSlice.actions;

export default jobFormSlice.reducer;
