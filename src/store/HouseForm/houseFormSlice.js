import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  users: [],
};

const houseFormSlice = createSlice({
  name: 'houseForm',
  initialState,
  reducers: {
    setUser: (state, {payload}) => {
      state.users = payload.users;
    },
  },
});

export const usersSelector = (state) => state.houseForm.users;

// Actions
export const {setUser} = houseFormSlice.actions;

export default houseFormSlice.reducer;
