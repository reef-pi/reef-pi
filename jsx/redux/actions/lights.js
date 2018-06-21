import {reduxDelete, reduxPut, reduxGet, reduxPost} from '../../utils/ajax'

export const lightsLoaded = (s) => {
  return ({
    type: 'LIGHTS_LOADED',
    payload: s
  })
}

export const lightLoaded = (id) => {
  return((l) => {
    return ({
      type: 'LIGHT_LOADED',
      payload: {light:l, id: id}
    })
  })
}

export const fetchLights = () => {
  return (reduxGet({
    url: '/api/lights',
    success: lightsLoaded
  }))
}

export const fetchLight = (id) => {
  return (reduxGet({
    url: '/api/lights/'+id,
    success: lightLoaded(id)
  }))
}

export const createLight = (s) => {
  return (reduxPut({
    url: '/api/lights',
    success: fetchLights,
    data: s
  }))
}

export const updateLight = (id, l) => {
  return (reduxPost({
    url: '/api/lights/'+id,
    success: fetchLights,
    data: l 
  }))
}

export const deleteLight = (s) => {
  return (reduxDelete({
    url: '/api/lights/'+s,
    success: fetchLights,
  }))
}
