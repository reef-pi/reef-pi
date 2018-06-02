
export const rootReducer = (state, action) => {
  switch(action.type){
    case 'INFO_LOADED':
      return { ...state, info: action.payload }
    default:
      return state;
  }
};
