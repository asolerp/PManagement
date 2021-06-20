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
    editForm: (state, {payload}) => {
      state.job = {
        ...state.job,
        ...payload.job,
        ...payload.form,
      };
    },
    resetTask: (state, {payload}) => {},
    resetForm: (state, {payload}) => {},
  },
});

// Selectors
export const jobSelector = (state) => state.jobForm;
export const houseSelector = (state) => state.jobForm?.house;
export const workersSelector = (state) => state.jobForm?.workers;
export const observationsSelector = (state) => state.jobForm?.observations;
export const dateSelector = (state) => state.jobForm?.date;

// Actions
export const {setForm, setTask, editForm, resetTask, resetForm} =
  jobFormSlice.actions;

export default jobFormSlice.reducer;
