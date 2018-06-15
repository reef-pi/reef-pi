export const rootReducer = (state, action) => {
  switch (action.type) {
    case 'INFO_LOADED':
      return { ...state, info: action.payload }
    case 'TCS_LOADED':
      return { ...state, tcs: action.payload }
    case 'TIMERS_LOADED':
      return { ...state, timers: action.payload }
    case 'ATOS_LOADED':
      return { ...state, atos: action.payload }
    case 'ATO_LOADED':
      return { ...state, config: action.payload }
    case 'ATO_USAGE_LOADED':
      var ato_usage = state.ato_usage
      ato_usage[action.payload.id] = action.payload.data
      return { ...state, ato_usage: ato_usage }
    case 'LIGHTS_LOADED':
      return { ...state, lights: action.payload }
    case 'DASHBOARD_LOADED':
      return { ...state, dashboard: action.payload }
    case 'PH_PROBES_LOADED':
      return { ...state, phs: action.payload }
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
      var camera = state.camera
      camera.images = action.payload
      return { ...state, camera: camera }
    case 'LATEST_IMAGE_LOADED':
      var camera = state.camera
      camera.latest = action.payload
      return { ...state, camera: camera }
    case 'CAMERA_CONFIG_LOADED':
      var camera = state.camera
      camera.config = action.payload
      return { ...state, camera: camera }
    case 'DOSING_PUMPS_LOADED':
      return { ...state, dosers: action.payload }
    case 'CREDS_UPDATED', 'RELOADED', 'REBOOTED', 'POWER_OFFED', 'DASHBOARD_UPDATED',
        'SETTINGS_UPDATED', 'DISPLAY_SWITCHED', 'BRIGHTNESS_SET',
        'DOSING_PUMP_CREATED', 'DOSING_PUMP_DELETED', 'DOSING_PUMP_CALIBRATED',
        'ATO_UPDATED', 'ATO_DELETED','DOSING_PUMP_SCHEDULE_UPDATED',
        'TIMER_CREATED', 'TIMER_DELETED':
      return state
    default:
      console.log('Unknown action in redux-reducer:|' + action.type + '|')
      return state
  }
}
