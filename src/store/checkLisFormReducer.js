const INITIAL_CHECKLIST_FORM_STATE = {
  job: {},
};

export const checkListFormReducer = (
  state = INITIAL_CHECKLIST_FORM_STATE,
  action,
) => {
  switch (action.type) {
    case 'SET_CHECKLIST_FORM_JOB':
      return {
        ...state,
        checklist: {...state.checklist, [action.label]: action.payload},
      };
    case 'RESET_CHECKLIST_FORM':
      return {
        ...state,
        checklist: {},
      };
    default:
      return state;
  }
};
