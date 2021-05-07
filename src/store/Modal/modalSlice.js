import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  open: false,
  content: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    changeState: (state, {payload}) => {
      state.open = payload.state;
    },
    setModalContent: (state, {payload}) => {
      state.content = payload.content;
    },
  },
});

// Selectors
export const openSelector = (state) => state.modal.open;
export const contentSelector = (state) => state.modal.content;

// Actions
export const {changeState, setModalContent} = modalSlice.actions;

export default modalSlice.reducer;
