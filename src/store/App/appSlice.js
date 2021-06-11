import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {deleteChecklist} from '../../Services';

const initialState = {
  loading: false,
};

export const deleteCheckListAction = createAsyncThunk(
  'checklist/delete',
  async (checkId) => {
    console.log(checkId);
    deleteChecklist(checkId);
  },
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateLoadingState: (state, {payload}) => {
      state.loading = payload.loading;
    },
  },
  extraReducers: {
    [deleteCheckListAction.pending]: (state) => {
      if (!state.loading) {
        state.loading = true;
      }
    },
    [deleteCheckListAction.fulfilled]: (state) => {
      if (state.loading) {
        state.loading = false;
      }
    },
    [deleteCheckListAction.rejected]: (state, action) => {
      if (state.loading) {
        state.loading = false;
        state.error = action.err;
      }
    },
  },
});

// Selectors
export const loadingSelector = (state) => state.app.loading;

// Actions
export const {updateLoadingState} = appSlice.actions;

export default appSlice.reducer;
