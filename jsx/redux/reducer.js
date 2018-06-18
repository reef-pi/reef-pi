export const rootReducer = (state, action) => {
  var camera = state.camera
  var atoUsage = state.ato_usage
  var tcUsage = state.tc_usage
  var pHreadings = state.ph_readings

  switch (action.type) {
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
    case 'TCS_LOADED':
      return { ...state, tcs: action.payload }
    case 'TC_SENSORS_LOADED':
      return { ...state, tc_sensors: action.payload }
    case 'TC_USAGE_LOADED':
      tcUsage[action.payload.id] = action.payload.usage
      return { ...state, tc_usage: tcUsage }
    case 'LIGHTS_LOADED':
      return { ...state, lights: action.payload }
    case 'DASHBOARD_LOADED':
      return { ...state, dashboard: action.payload }
    case 'PH_PROBES_LOADED':
      return { ...state, phprobes: action.payload }
    case 'PH_PROBE_READINGS_LOADED':
      pHreadings[action.payload.id] = action.payload.readings
      return { ...state, ph_readings: pHreadings }
    case 'CAPABILITIES_LOADED':
      return { ...state, capabilities: action.payload }
    case 'SETTINGS_LOADED':
      return { ...state, settings: action.payload }
    case 'JACKS_LOADED':
      return { ...state, jacks: action.payload }
    case 'INLETS_LOADED':
      return { ...state, inlets: action.payload }
    case 'OUTLETS_LOADED':
      return { ...state, outlets: action.payload }
    case 'EQUIPMENTS_LOADED':
      return { ...state, equipments: action.payload }
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
    case 'CREDS_UPDATED':
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
    case 'DOSING_PUMP_SCHEDULE_UPDATED':
    case 'TIMER_CREATED':
    case 'TIMER_DELETED':
      return state
    default:
      console.log('Unknown action in redux-reducer:|' + action.type + '|')
      return state
  }
}
