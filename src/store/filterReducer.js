const INITIAL_FILTER_STATE = {
  houses: [],
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
