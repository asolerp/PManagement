import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  job: {
    mode: 'new',
    task: undefined,
  },
};

const jobFormSlice = createSlice({
  name: 'jobForm',
  initialState,
  reducers: {
    setInputForm: (state, {payload}) => {},
    setTask: (state, {payload}) => {},
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

// Actions
export const {
  setInputForm,
  setTask,
  editForm,
  resetTask,
  resetForm,
} = jobFormSlice.actions;

export default jobFormSlice.reducer;
