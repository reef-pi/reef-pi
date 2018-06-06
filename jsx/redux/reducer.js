export const rootReducer = (state, action) => {
  switch (action.type) {
    case 'INFO_LOADED':
      return { ...state, info: action.payload }
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
    case 'CREDS_UPDATED', 'RELOADED', 'REBOOTED', 'POWER_OFFED', 'SETTINGS_UPDATED':
      return state
    default:
      return state
  }
}
