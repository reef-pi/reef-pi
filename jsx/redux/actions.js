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

export const jacksLoaded = (jacks) => {
  return ({
    type: 'JACKS_LOADED',
    payload: jacks
  })
}

export const fetchJacks = () => {
  return (
    reduxGet({
      url: '/api/jacks',
      success: jacksLoaded
    }))
}

export const equipmentsLoaded = (equipments) => {
  return ({
    type: 'EQUIPMENTS_LOADED',
    payload: equipments
  })
}

export const fetchEquipments = () => {
  return (
    reduxGet({
      url: '/api/equipments',
      success: equipmentsLoaded
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
export const inletsLoaded = (inlets) => {
  return ({
    type: 'INLETS_LOADED',
    payload: inlets
  })
}

export const fetchInlets = () => {
  return (
    reduxGet({
      url: '/api/inlets',
      success: inletsLoaded
    }))
}

export const deleteInlet = (id) => {
  return (
    reduxDelete({
      url: '/api/inlets/' + id,
      success: fetchInlets
    }))
}

export const createInlet = (inlet) => {
  return (
    reduxPut({
      url: '/api/inlets',
      data: inlet,
      success: fetchInlets
    }))
}
