import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  quadrant: {},
};

const quadrantFormSlice = createSlice({
  name: 'quadrantForm',
  initialState,
  reducers: {
    setQuadrant: (state, {payload}) => {
      state.quadrant = payload.quadrant;
    },
    setJobsToQuadrant: (state, {payload}) => {
      state.quadrant[payload.houseId] = payload.jobs;
    },
    clearQuadrant: (state, {payload}) => {
      state.quadrant = {};
    },
  },
});

export const quadrantSelector = (state) => state.quadrantForm.quadrant;

// Actions
export const {setJobsToQuadrant, setQuadrant, clearQuadrant} =
  quadrantFormSlice.actions;

export default quadrantFormSlice.reducer;
