import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {rootReducer} from './reducer'

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
  capabilities: [],
  health_stats: {},
  inlets: [],
  jacks: [],
  outlets: []
}
export const configureStore = () => {
  return createStore(rootReducer, initialState, applyMiddleware(thunk))
}
