const INITIAL_JOB_FORM_STATE = {
  job: {
    mode: 'new',
    task: undefined,
  },
};

export const jobFormReducer = (state = INITIAL_JOB_FORM_STATE, action) => {
  switch (action.type) {
    case 'EDIT_FORM':
      return {
        ...state,
        job: {
          ...state.job,
          ...action.payload,
        },
      };
    case 'CHANGE_FORM_MODE':
      return {
        ...state,
        job: {
          ...state.job,
          mode: action.payload,
        },
      };
    case 'SET_FORM_JOB':
      return {
        ...state,
        job: {...state.job, [action.label]: action.payload},
      };
    case 'SET_TASK':
      return {
        ...state,
        job: {
          ...state.job,
          task: action.payload,
        },
      };
    case 'RESET_FORM':
      return {
        ...state,
        job: {
          mode: 'new',
          tasks: [],
        },
      };
    default:
      return state;
  }
};
