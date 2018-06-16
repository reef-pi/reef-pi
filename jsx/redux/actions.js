import SignIn from '../sign_in.jsx'
import {reduxGet, reduxPost, reduxPut, reduxDelete} from '../utils/ajax'

export const infoLoaded = (info) => {
  return ({
    type: 'INFO_LOADED',
    payload: info
  })
}

export const fetchInfo = () => {
  return (reduxGet({
    url: '/api/info',
    success: infoLoaded
  }))
}

export const settingsLoaded = (s) => {
  return ({
    type: 'SETTINGS_LOADED',
    payload: s
  })
}

export const fetchSettings = () => {
  return (reduxGet({
    url: '/api/settings',
    success: settingsLoaded
  }))
}

export const settingsUpdated = () => {
  return ({
    type: 'SETTINGS_UPDATED'
  })
}

export const updateSettings = (s) => {
  return (reduxPost({
    url: '/api/settings',
    success: settingsUpdated,
    data: s
  }))
}

export const capabilitiesLoaded = (capabilities) => {
  return ({
    type: 'CAPABILITIES_LOADED',
    payload: capabilities
  })
}

export const fetchCapabilities = () => {
  return (
    reduxGet({
      url: '/api/capabilities',
      success: capabilitiesLoaded
    }))
}

export const healthStatsLoaded = (stats) => {
  return ({
    type: 'HEALTH_STATS_LOADED',
    payload: stats
  })
}

export const fetchHealth = () => {
  return (
    reduxGet({
      url: '/api/health_stats',
      success: healthStatsLoaded
    }))
}

export const credsUpdated = () => {
  return ({
    type: 'CREDS_UPDATED'
  })
}

export const updateCreds = (creds) => {
  return (
    reduxPost({
      url: '/api/credentials',
      data: creds,
      success: credsUpdated
    }))
}
