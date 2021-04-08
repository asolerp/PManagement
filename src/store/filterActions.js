export const setFilterDate = (date) => {
  return {
    type: 'SET_DATE',
    payload: date,
  };
};

export const setStatusTaskFilter = (status) => {
  return {
    type: 'SET_STATUS_TASK_FILTER',
    payload: status,
  };
};

export const setStatusIncidenceFilter = (status) => {
  return {
    type: 'SET_STATUS_INCIDENCE_FILTER',
    payload: status,
  };
};

export const setFilterByType = (storage, type, value) => {
  return {
    type: 'SET_FILTER_BY_TYPE',
    payload: {
      storage,
      type,
      value,
    },
  };
};
