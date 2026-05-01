import { deleteAction, getAction, postAction, putAction } from './api'

export const phProbesLoaded = (s) => {
  return ({
    type: 'PH_PROBES_LOADED',
    payload: s
  })
}
export const probeReadingsLoaded = (id) => {
  return (s) => {
    return ({
      type: 'PH_PROBE_READINGS_LOADED',
      payload: { readings: s, id }
    })
  }
}

export const probeUpdated = () => {
  return ({
    type: 'PH_PROBE_UPDATED'
  })
}

export const probeCalibrated = () => {
  return ({
    type: 'PH_PROBE_CALIBRATED'
  })
}

export const fetchPhProbes = () => {
  return getAction('phprobes', phProbesLoaded)
}

export const readProbe = (id) => {
  return getAction(['phprobes', id, 'read'], probeReadComplete(id))
}

export const probeReadComplete = (id) => {
  return (s) => {
    return ({
      type: 'PH_PROBE_READING_COMPLETE',
      payload: { reading: s, id }
    })
  }
}

export const fetchProbeReadings = (id) => {
  return getAction(['phprobes', id, 'readings'], probeReadingsLoaded(id))
}

export const updateProbe = (id, a) => {
  return postAction(['phprobes', id], a, fetchPhProbes)
}

export const createProbe = (a) => {
  return putAction('phprobes', a, fetchPhProbes)
}

export const deleteProbe = (id) => {
  return deleteAction(['phprobes', id], fetchPhProbes)
}

export const calibrateProbe = (id, a) => {
  return postAction(['phprobes', id, 'calibratepoint'], a, probeCalibrated)
}
