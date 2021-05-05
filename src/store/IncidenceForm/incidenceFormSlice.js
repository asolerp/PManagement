import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  images: [],
  incidence: {},
};

const incidenceFormSlice = createSlice({
  name: 'incidenceForm',
  initialState,
  reducers: {
    setInputForm: (state, {payload}) => {
      state.incidence = {...state.incidence, [payload.label]: payload.value};
    },
    setImages: (state, {payload}) => {
      state.incidenceImages = payload.images;
    },
    resetForm: (state) => {
      state.incidence = {};
      state.images = [];
    },
  },
});

export const {setInputForm, setImages, resetForm} = incidenceFormSlice.actions;

export default incidenceFormSlice.reducer;
