import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {rootReducer} from './reducer'

const initialState = {
  info: {},
  equipments: [],
  timers: [],
  lights: [],
  atos: [],
  tcs: [],
  phs: [],
  dosers: [],
  camera: {},
  configuration: {},
  capabilities: [],
  health_stats: {},
  inlets: [],
  jacks: [],
  outlets: [],
  settings: {},
  dashboard: {},
}

export const configureStore = () => {
  return createStore(rootReducer, initialState, applyMiddleware(thunk))
}
