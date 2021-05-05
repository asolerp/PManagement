// import {applyMiddleware, combineReducers, createStore} from 'redux';
// import thunk from 'redux-thunk';

// REDUCERS
import {filterReducer} from './filterReducer';
import {jobFormReducer} from './jobFormReducer';
import {houseFormReducer} from './houseFormReducer';
import {incidenceFormReducer} from './incidenceFormReducer';
import {modalReducer} from './modalReducer';

import {checkListReducer} from './CheckList';
import {userReducer} from './User';

import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';

const reducers = combineReducers({
  filters: filterReducer,
  jobForm: jobFormReducer,
  checklist: checkListReducer,
  modal: modalReducer,
  incidenceForm: incidenceFormReducer,
  user: userReducer,
  houseForm: houseFormReducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false,
    });
    if (__DEV__) {
      const createDebugger = require('redux-flipper').default;
      middlewares.push(createDebugger());
    }
    return middlewares;
  },
});

export default store;
