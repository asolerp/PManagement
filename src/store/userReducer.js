const INITIAL_FILTER_STATE = {
  user: null,
};

export const userReducer = (state = INITIAL_FILTER_STATE, action) => {
  switch (action.type) {
    case 'SET_LOGED_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT_USER':
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};

export default userReducer;
