import subDays from 'date-fns/subDays';

const INITIAL_FILTER_STATE = {
  houses: [],
  checkLists: {
    houses: [],
    when: subDays(new Date(), 1),
  },
  filterDate: new Date(),
  statusTaskFilter: false,
  statusIncidenceFilter: false,
};

export const filterReducer = (state = INITIAL_FILTER_STATE, action) => {
  switch (action.type) {
    case 'ADD_HOUSE':
      return {
        ...state,
        houses: action.payload,
      };
    case 'SET_DATE':
      return {
        ...state,
        filterDate: action.payload,
      };
    case 'SET_FILTER_BY_TYPE':
      return {
        ...state,
        [action.payload.storage]: {
          ...state[action.payload.storage],
          [action.payload.type]: action.payload.value,
        },
      };
    case 'SET_STATUS_TASK_FILTER':
      return {
        ...state,
        statusTaskFilter: action.payload,
      };
    case 'SET_STATUS_INCIDENCE_FILTER':
      return {
        ...state,
        statusIncidenceFilter: action.payload,
      };
    default:
      return state;
  }
};

export default filterReducer;
