const INITIAL_JOB_FORM_STATE = {
  open: false,
  content: null,
};

export const modalReducer = (state = INITIAL_JOB_FORM_STATE, action) => {
  switch (action.type) {
    case 'CHANGE_STATE_MODAL':
      return {
        ...state,
        open: action.payload,
      };
    case 'SET_MODAL_CONTENT':
      return {
        ...state,
        content: action.payload,
      };
    default:
      return state;
  }
};
