import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { rootReducer } from './reducer'

const initialState = {
  info: {
    name: 'reef-pi'
  },
  errors: [],
  drivers: [],
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
  analog_inputs: [],
  outlets: [],
  settings: {},
  dashboard: {},
  display: {},
  ato_usage: {},
  doser_usage: {},
  macro_usage: {},
  tc_usage: {},
  ph_readings: {},
  tc_sensors: [],
  telemetry: {
  },
  camera: {
    config: {},
    latest: undefined,
    images: []
  },
  logs: [],
  alerts: [],
  instances: []
}
const store = createStore(rootReducer, initialState, applyMiddleware(thunk))
export const configureStore = () => {
  return store
}
