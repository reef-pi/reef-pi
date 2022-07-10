import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { rootReducer } from './reducer'

const initialState = {
  info: {
    name: 'reef-pi'
  },
  errors: [],
  drivers: [],
  driverOptions: {},
  equipment: [],
  timers: [],
  lights: [],
  atos: [],
  tcs: [],
  phprobes: [],
  macros: [],
  dosers: [],
  configuration: {},
  capabilities: {
    dev_mode: false
  },
  health_stats: {},
  inlets: [],
  jacks: [],
  analog_inputs: [],
  outlets: [],
  settings: {
    name: '',
    interface: '',
    address: '',
    notification: false,
    pprof: false,
    prometheus: false,
    cors: false,
    rpi_pwm_freq: 100
  },
  dashboard: {},
  display: {},
  ato_usage: {},
  doser_usage: {},
  macro_usage: {},
  tc_usage: {},
  light_usage: {},
  ph_readings: {},
  ph_reading: [],
  tc_sensors: [],
  tc_reading: [],
  journals: [],
  journal_usage: {},
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
