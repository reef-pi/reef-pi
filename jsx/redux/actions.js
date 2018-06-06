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

export const deleteJack = (id) => {
  return (
    reduxDelete({
      url: '/api/jacks/' + id,
      success: fetchJacks
    }))
}

export const createJack = (jack) => {
  return (
    reduxPut({
      url: '/api/jacks',
      data: jack,
      success: fetchJacks
    }))
}

export const outletsLoaded = (outlets) => {
  return ({
    type: 'OUTLETS_LOADED',
    payload: outlets
  })
}

export const fetchOutlets = () => {
  return (
    reduxGet({
      url: '/api/outlets',
      success: outletsLoaded
    }))
}

export const deleteOutlet = (id) => {
  return (
    reduxDelete({
      url: '/api/outlets/' + id,
      success: fetchOutlets
    }))
}

export const createOutlet = (outlet) => {
  return (
    reduxPut({
      url: '/api/outlets',
      data: outlet,
      success: fetchOutlets
    }))
}
