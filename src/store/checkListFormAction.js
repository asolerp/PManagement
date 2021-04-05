export const setInputForm = (label, value) => {
  return {
    type: 'SET_CHECKLIST_FORM_JOB',
    label: label,
    payload: value,
  };
};

export const resetForm = () => {
  return {
    type: 'RESET_CHECKLIST_FORM',
  };
};
