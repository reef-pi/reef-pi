import {reduxGet, reduxPut, reduxDelete, reduxPost} from '../../utils/ajax'

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
  return((s) =>{
    return ({
      type: 'TC_USAGE_LOADED',
      payload: {id: id, usage: s}
    })
  })
}

export const fetchTCs = () => {
  return (reduxGet({
    url: '/api/tcs',
    success: tcsLoaded
  }))
}

export const createTC = (t) => {
  return (reduxPut({
    url: '/api/tcs',
    data: t,
    success: fetchTCs
  }))
}

export const updateTC = (id, t) => {
  return (reduxPost({
    url: '/api/tcs/'+id,
    data: t,
    success: fetchTCs
  }))
}

export const deleteTC = (id) => {
  return (reduxDelete({
    url: '/api/tcs/'+id,
    success: fetchTCs
  }))
}

export const fetchSensors = () => {
  return (reduxGet({
    url: '/api/tcs/sensors',
    success: sensorsLoaded
  }))
}

export const fetchTCUsage = (id) => {
  return (reduxGet({
    url: '/api/tcs/'+id+'/usage',
    success: tcUsageLoaded(id)
  }))
}
