import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  users: [],
};

const quadrantFormSlice = createSlice({
  name: 'quadrantForm',
  initialState,
  reducers: {
    setUser: (state, {payload}) => {
      state.users = payload.users;
    },
  },
});

export const usersSelector = (state) => state.quadrantForm.users;

// Actions
export const {setUser} = quadrantFormSlice.actions;

export default quadrantFormSlice.reducer;
