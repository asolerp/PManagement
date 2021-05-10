import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loading: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateLoadingState: (state, {payload}) => {
      state.loading = payload.loading;
    },
  },
});

// Selectors
export const loadingSelector = (state) => state.app.loading;

// Actions
export const {updateLoadingState} = appSlice.actions;

export default appSlice.reducer;
