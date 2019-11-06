export const rootReducer = (state, action) => {
  if (action.type.startsWith('@@redux/INIT')) {
    return state
  }
  const camera = state.camera
  const atoUsage = state.ato_usage
  const doserUsage = state.doser_usage
  const macroUsage = state.macro_usage
  const tcUsage = state.tc_usage
  const tcReading = []
  const pHreadings = state.ph_readings
  const phReading = []

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
      atoUsage[action.payload.id] = action.payload.data
      return { ...state, ato_usage: atoUsage }
    case 'DOSER_USAGE_LOADED':
      doserUsage[action.payload.id] = action.payload.data
      return { ...state, doser_usage: doserUsage }
    case 'MACROS_LOADED':
      return { ...state, macros: action.payload }
    case 'MACRO_USAGE_LOADED':
      macroUsage[action.payload.id] = action.payload.data
      return { ...state, macro_usage: macroUsage }
    case 'TCS_LOADED':
      return { ...state, tcs: action.payload }
    case 'TC_SENSORS_LOADED':
      return { ...state, tc_sensors: action.payload }
    case 'TC_USAGE_LOADED':
      tcUsage[action.payload.id] = action.payload.usage
      return { ...state, tc_usage: tcUsage }
    case 'TC_READING_COMPLETE':
      tcReading[action.payload.id] = action.payload.reading
      return { ...state, tc_reading: { ...tcReading } }
    case 'LIGHTS_LOADED':
      return { ...state, lights: action.payload }
    case 'DASHBOARD_LOADED':
      return { ...state, dashboard: action.payload }
    case 'PH_PROBES_LOADED':
      return { ...state, phprobes: action.payload }
    case 'PH_PROBE_READINGS_LOADED':
      pHreadings[action.payload.id] = action.payload.readings
      return { ...state, ph_readings: pHreadings }
    case 'PH_PROBE_READING_COMPLETE':
      phReading[action.payload.id] = action.payload.reading
      return { ...state, ph_reading: { ...phReading } }
    case 'CAPABILITIES_LOADED':
      return { ...state, capabilities: action.payload }
    case 'SETTINGS_LOADED':
      return { ...state, settings: action.payload }
    case 'DRIVERS_LOADED':
      return { ...state, drivers: action.payload }
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
      camera.images = action.payload
      return { ...state, camera: camera }
    case 'LATEST_IMAGE_LOADED':
      camera.latest = action.payload
      return { ...state, camera: camera }
    case 'CAMERA_CONFIG_LOADED':
      camera.config = action.payload
      return { ...state, camera: camera }
    case 'DOSING_PUMPS_LOADED':
      return { ...state, dosers: action.payload }
    case 'INSTANCES_LOADED':
      return { ...state, instances: action.payload }
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
    case 'API_FAILURE':
    case 'TELEMETRY_TEST_MESSAGE_SENT':
      return state
    default:
      console.log('Unknown action in redux-reducer:|' + action.type + '|')
      return state
  }
}
