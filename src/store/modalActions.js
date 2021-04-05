export const changeState = (state) => {
  return {
    type: 'CHANGE_STATE_MODAL',
    payload: state,
  };
};

export const setModalContent = (content) => {
  return {
    type: 'SET_MODAL_CONTENT',
    payload: content,
  };
};
