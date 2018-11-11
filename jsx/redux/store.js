import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { rootReducer } from './reducer'

const initialState = {
  info: {
    name: 'reef-pi'
  },
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
  telemetry: {
    adafruitio: {
      enable: false,
      token: '',
      user: '',
      prefix: '',
    },
    mailer: {
      server: '',
      port: 456,
      from: '',
      to: '',
      password: ''
    },
    notify: false,
    throttle: 10
  },
  camera: {
    config: {},
    latest: undefined,
    images: []
  },
  logs: [],
  alerts: []
}
const store = createStore(rootReducer, initialState, applyMiddleware(thunk))
export const configureStore = () => {
  return store
}
