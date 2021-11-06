import { reduxDelete, reduxPut, reduxGet, reduxPost } from '../../utils/ajax'

export const lightsLoaded = (s) => {
  for (const i in s) {
    for (const x in s[i].channels) {
      if (s[i].channels[x].profile.type === 'lunar') {
        s[i].channels[x].profile.config.full_moon = Date.parse(s[i].channels[x].profile.config.full_moon)
      }
    }
  }

  return ({
    type: 'LIGHTS_LOADED',
    payload: s
  })
}

export const lightLoaded = (id) => {
  return (l) => {
    return ({
      type: 'LIGHT_LOADED',
      payload: { light: l, id: id }
    })
  }
}

export const lightUsageLoaded = (id) => {
  return (u) => {
    return ({
      type: 'LIGHT_USAGE_LOADED',
      payload: { usage: u, id: id }
    })
  }
}

export const fetchLights = () => {
  return (reduxGet({
    url: '/api/lights',
    success: lightsLoaded
  }))
}

export const fetchLight = (id) => {
  return (reduxGet({
    url: '/api/lights/' + id,
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
    url: '/api/lights/' + id,
    success: fetchLights,
    data: l
  }))
}

export const deleteLight = (s) => {
  return (reduxDelete({
    url: '/api/lights/' + s,
    success: fetchLights
  }))
}

export const fetchLightUsage = (id) => {
  return (reduxGet({
    url: '/api/lights/' + id + '/usage',
    success: lightUsageLoaded(id)
  }))
}
