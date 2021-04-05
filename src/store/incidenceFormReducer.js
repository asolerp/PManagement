const INITIAL_JOB_FORM_STATE = {
  images: [],
  incidence: {},
};

export const incidenceFormReducer = (
  state = INITIAL_JOB_FORM_STATE,
  action,
) => {
  switch (action.type) {
    case 'SET_FORM_INCIDENCE':
      return {
        ...state,
        incidence: {...state.incidence, [action.label]: action.payload},
      };
    case 'SET_IMAGES':
      return {
        ...state,
        incidenceImages: action.payload,
      };
    case 'RESET_FORM':
      return {
        incidence: {},
        images: [],
      };
    default:
      return state;
  }
};
