// import {applyMiddleware, combineReducers, createStore} from 'redux';
// import thunk from 'redux-thunk';

// REDUCERS
import {filterReducer} from './Filters';
import {modalReducer} from './Modal';
import {incidenceFormReducer} from './IncidenceForm';
import {checkListReducer} from './CheckList';
import {houseFormReducer} from './HouseForm';
import {jobFormReducer} from './JobForm';
import {userReducer} from './User';
import {appReducer} from './App';

import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';

const reducers = combineReducers({
  app: appReducer,
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
