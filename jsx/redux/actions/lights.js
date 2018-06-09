import {reduxGet, reduxPost} from '../../utils/ajax'

export const lightsLoaded = (s) => {
  return ({
    type: 'LIGHTS_LOADED',
    payload: s
  })
}

export const fetchLights = () => {
  return (reduxGet({
    url: '/api/lights',
    success: lightsLoaded
  }))
}
