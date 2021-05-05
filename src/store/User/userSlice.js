import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  loggedUser: undefined,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logUser: (state, {payload}) => {
      state.loggedUser = payload.user;
    },
    logout: (state) => {
      state.loggedUser = null;
    },
  },
});

// Selectors
export const userSelector = (state) => state.user.loggedUser;

// Actions
export const {logUser, logout} = userSlice.actions;

export default userSlice.reducer;
