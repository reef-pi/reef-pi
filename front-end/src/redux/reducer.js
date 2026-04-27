import { createInitialState } from './state'

const updateByID = (collection = {}, id, value) => ({
  ...collection,
  [id]: value
})

const updateCamera = (camera = {}, updates) => ({
  ...camera,
  ...updates
})

export const rootReducer = (state = createInitialState(), action) => {
  if (action.type.startsWith('@@redux/INIT')) {
    return state
  }

  switch (action.type) {
    case 'LOG_DELETED':
      return {
        ...state,
        logs: state.logs.filter(a => {
          return action.payload.ts !== a.ts
        })
      }
    case 'LOG_ADDED':
      return { ...state, logs: [action.payload].concat(state.logs) }
    case 'ALERT_DELETED':
      return {
        ...state,
        alerts: state.alerts.filter(a => {
          return action.payload.ts !== a.ts
        })
      }
    case 'ALERT_ADDED':
      return { ...state, alerts: [action.payload].concat(state.alerts) }
    case 'ERRORS_LOADED':
      return { ...state, errors: action.payload }
    case 'INFO_LOADED':
      return { ...state, info: action.payload }
    case 'TELEMETRY_LOADED':
      return { ...state, telemetry: action.payload }
    case 'TIMERS_LOADED':
      return { ...state, timers: action.payload }
    case 'ATOS_LOADED':
      return { ...state, atos: action.payload }
    case 'ATO_LOADED':
      return { ...state, config: action.payload }
    case 'ATO_USAGE_LOADED':
      return { ...state, ato_usage: updateByID(state.ato_usage, action.payload.id, action.payload.data) }
    case 'DOSER_USAGE_LOADED':
      return { ...state, doser_usage: updateByID(state.doser_usage, action.payload.id, action.payload.data) }
    case 'MACROS_LOADED':
      return { ...state, macros: action.payload }
    case 'MACRO_USAGE_LOADED':
      return { ...state, macro_usage: updateByID(state.macro_usage, action.payload.id, action.payload.data) }
    case 'TCS_LOADED':
      return { ...state, tcs: action.payload }
    case 'TC_SENSORS_LOADED':
      return { ...state, tc_sensors: action.payload }
    case 'TC_USAGE_LOADED':
      return { ...state, tc_usage: updateByID(state.tc_usage, action.payload.id, action.payload.usage) }
    case 'TC_READING_COMPLETE':
      return { ...state, tc_reading: updateByID(state.tc_reading, action.payload.id, action.payload.reading) }
    case 'LIGHTS_LOADED':
      return { ...state, lights: action.payload }
    case 'LIGHT_USAGE_LOADED':
      return { ...state, light_usage: updateByID(state.light_usage, action.payload.id, action.payload.usage) }
    case 'DASHBOARD_LOADED':
      return { ...state, dashboard: action.payload }
    case 'PH_PROBES_LOADED':
      return { ...state, phprobes: action.payload }
    case 'PH_PROBE_READINGS_LOADED':
      return { ...state, ph_readings: updateByID(state.ph_readings, action.payload.id, action.payload.readings) }
    case 'PH_PROBE_READING_COMPLETE':
      return { ...state, ph_reading: updateByID(state.ph_reading, action.payload.id, action.payload.reading) }
    case 'CAPABILITIES_LOADED':
      return { ...state, capabilities: action.payload }
    case 'SETTINGS_LOADED':
      return { ...state, settings: action.payload }
    case 'DRIVERS_LOADED':
      return { ...state, drivers: action.payload }
    case 'DRIVER_OPTIONS_LOADED':
      return { ...state, driverOptions: action.payload }
    case 'JACKS_LOADED':
      return { ...state, jacks: action.payload }
    case 'ANALOG_INPUTS_LOADED':
      return { ...state, analog_inputs: action.payload }
    case 'INLETS_LOADED':
      return { ...state, inlets: action.payload }
    case 'OUTLETS_LOADED':
      return { ...state, outlets: action.payload }
    case 'EQUIPMENTS_LOADED':
      return { ...state, equipment: action.payload }
    case 'HEALTH_STATS_LOADED':
      return { ...state, health_stats: action.payload }
    case 'DISPLAY_LOADED':
      return { ...state, display: action.payload }
    case 'IMAGES_LOADED':
      return { ...state, camera: updateCamera(state.camera, { images: action.payload }) }
    case 'LATEST_IMAGE_LOADED':
      return { ...state, camera: updateCamera(state.camera, { latest: action.payload }) }
    case 'CAMERA_CONFIG_LOADED':
      return { ...state, camera: updateCamera(state.camera, { config: action.payload }) }
    case 'DOSING_PUMPS_LOADED':
      return { ...state, dosers: action.payload }
    case 'INSTANCES_LOADED':
      return { ...state, instances: action.payload }
    case 'JOURNALS_LOADED':
      return { ...state, journals: action.payload }
    case 'FLOW_METERS_LOADED':
      return { ...state, flow_meters: action.payload }
    case 'FLOW_METER_READINGS_LOADED':
      return { ...state, flow_meter_readings: updateByID(state.flow_meter_readings, action.payload.id, action.payload.readings) }
    case 'JOURNAL_USAGE_LOADED':
      return { ...state, journal_usage: updateByID(state.journal_usage, action.payload.id, action.payload.data) }
    case 'JOURNAL_RECORDED':
    case 'JOURNAL_UPDATED':
    case 'JOURNAL_LOADED':
    case 'CREDS_UPDATED':
    case 'EQUIPMENT_UPDATED':
    case 'RELOADED':
    case 'REBOOTED':
    case 'POWER_OFFED':
    case 'DASHBOARD_UPDATED':
    case 'SETTINGS_UPDATED':
    case 'DISPLAY_SWITCHED':
    case 'BRIGHTNESS_SET':
    case 'DOSING_PUMP_CREATED':
    case 'DOSING_PUMP_DELETED':
    case 'DOSING_PUMP_CALIBRATED':
    case 'ATO_UPDATED':
    case 'ATO_DELETED':
    case 'MACRO_UPDATED':
    case 'MACRO_DELETED':
    case 'DOSING_PUMP_SCHEDULE_UPDATED':
    case 'TIMER_CREATED':
    case 'TIMER_DELETED':
    case 'MACRO_RUN':
    case 'MACRO_REVERT':
    case 'API_FAILURE':
    case 'TELEMETRY_TEST_MESSAGE_SENT':
    case 'DB_IMPORTED':
    case 'UPGRADED':
      return state
    default:
      console.log('Unknown action in redux-reducer:|' + action.type + '|')
      return state
  }
}
