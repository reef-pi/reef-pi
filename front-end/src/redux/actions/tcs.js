import { deleteAction, getAction, postAction, putAction } from './api'

export const tcsLoaded = (s) => {
  return ({
    type: 'TCS_LOADED',
    payload: s
  })
}

export const sensorsLoaded = (s) => {
  return ({
    type: 'TC_SENSORS_LOADED',
    payload: s
  })
}

export const tcUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'TC_USAGE_LOADED',
      payload: { id, usage: s }
    })
  }
}

export const fetchTCs = () => {
  return getAction('tcs', tcsLoaded)
}

export const createTC = (t) => {
  return putAction('tcs', t, fetchTCs)
}

export const updateTC = (id, t) => {
  return postAction(['tcs', id], t, fetchTCs)
}

export const deleteTC = (id) => {
  return deleteAction(['tcs', id], fetchTCs)
}

export const fetchSensors = () => {
  return getAction(['tcs', 'sensors'], sensorsLoaded)
}

export const fetchTCUsage = (id) => {
  return getAction(['tcs', id, 'usage'], tcUsageLoaded(id))
}

export const readTC = (id) => {
  return getAction(['tcs', id, 'read'], tcReadComplete(id))
}

export const tcReadComplete = (id) => {
  return (s) => {
    return ({
      type: 'TC_READING_COMPLETE',
      payload: { reading: s, id }
    })
  }
}

export const calibrateTemperature = (id, c) => {
  return postAction(['tcs', id, 'calibrate'], c, tcCalibrated)
}

export const tcCalibrated = () => {
  return ({
    type: 'TC_CALIBRATED'
  })
}
