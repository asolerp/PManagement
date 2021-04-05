import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';

// REDUCERS
import {userReducer} from './userReducer';
import {filterReducer} from './filterReducer';
import {jobFormReducer} from './jobFormReducer';
import {houseFormReducer} from './houseFormReducer';
import {incidenceFormReducer} from './incidenceFormReducer';
import {modalReducer} from './modalReducer';
import {checkListFormReducer} from './checkLisFormReducer';

const rootReducer = combineReducers({
  filters: filterReducer,
  jobForm: jobFormReducer,
  checklistForm: checkListFormReducer,
  modal: modalReducer,
  incidenceForm: incidenceFormReducer,
  userLoggedIn: userReducer,
  houseForm: houseFormReducer,
});

let middlewaresToApply = [thunk];

if (__DEV__) {
  const createFlipperDebugger = require('redux-flipper').default;
  middlewaresToApply.push(createFlipperDebugger());
}

const middelware = applyMiddleware(...middlewaresToApply);

const store = createStore(rootReducer, middelware);

export default store;
