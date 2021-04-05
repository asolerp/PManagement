export const setInputForm = (label, value) => {
  return {
    type: 'SET_FORM_INCIDENCE',
    label: label,
    payload: value,
  };
};

export const setImages = (images) => async (dispatch, getState) => {
  dispatch({
    type: 'SET_IMAGES',
    payload: images,
  });
};

export const resetForm = () => {
  return {
    type: 'RESET_FORM',
  };
};
