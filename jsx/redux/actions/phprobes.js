import {reduxPut, reduxDelete, reduxGet, reduxPost} from '../../utils/ajax'

export const phProbesLoaded = (s) => {
  return ({
    type: 'PH_PROBES_LOADED',
    payload: s
  })
}
export const probeReadingsLoaded = (id) => {
  return((s) => {
    return ({
      type: 'PH_PROBE_READINGS_LOADED',
      payload: {readings: s, id: id}
    })
  })
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
  return (reduxGet({
    url: '/api/phprobes',
    success: phProbesLoaded
  }))
}

export const fetchProbeReadings = (id) => {
  return (reduxGet({
    url: '/api/phprobes/'+id+'/readings',
    success: probeReadingsLoaded(id)
  }))
}

export const updateProbe = (id, a) => {
  return (reduxPost({
    url: '/api/phprobes/'+id,
    data: a,
    success: probeUpdated
  }))
}

export const createProbe = (a) => {
  return (reduxPut({
    url: '/api/phprobes',
    data: a,
    success: fetchPhProbes
  }))
}

export const deleteProbe = (id) => {
  return (reduxDelete({
    url: '/api/phprobes/'+id,
    success: fetchPhProbes
  }))
}

export const calibrateProbe = (id, a) => {
  return (reduxPost({
    url: '/api/phprobes/'+id+'/calibrate',
    data: a,
    success: probeCalibrated
  }))
}
