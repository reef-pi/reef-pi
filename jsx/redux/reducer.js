const initialState = {
  info: {},
  equipments: [],
  timers: [],
  lights: [],
  atos: [],
  phs: [],
  dosers: [],
  camera: {},
  configuration: {},
  capabilities: []
}

export const rootReducer = (state = initialState, action) => {
  switch(action.type){
    case 'FETCH_INFO':
      return Object.assign(state, { info: action.payload })
    default:
      return state;
  }
};
