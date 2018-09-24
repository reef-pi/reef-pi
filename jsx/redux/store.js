import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { rootReducer } from './reducer'

const initialState = {
  info: {},
  errors: [],
  equipment: [],
  timers: [],
  lights: [],
  atos: [],
  tcs: [],
  phprobes: [],
  macros: [],
  dosers: [],
  configuration: {},
  capabilities: [],
  health_stats: {},
  inlets: [],
  jacks: [],
  outlets: [],
  settings: {},
  dashboard: {},
  display: {},
  ato_usage: {},
  macro_usage: {},
  tc_usage: {},
  ph_readings: {},
  tc_sensors: [],
  telemetry: {},
  camera: {
    config: {},
    latest: undefined,
    images: []
  },
  notifications: [{ ts: 1, type: 'INFO', content: 'Initialization Complete' }, { ts: new Date().getTime(), type: 'INFO', content: 'Initialization Complete' }]
}

export const configureStore = () => {
  return createStore(rootReducer, initialState, applyMiddleware(thunk))
}
