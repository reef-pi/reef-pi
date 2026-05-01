import { deleteAction, getAction, postAction, putAction } from './api'

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
      payload: { light: l, id }
    })
  }
}

export const lightUsageLoaded = (id) => {
  return (u) => {
    return ({
      type: 'LIGHT_USAGE_LOADED',
      payload: { usage: u, id }
    })
  }
}

export const fetchLights = () => {
  return getAction('lights', lightsLoaded)
}

export const fetchLight = (id) => {
  return getAction(['lights', id], lightLoaded(id))
}

export const createLight = (s) => {
  return putAction('lights', s, fetchLights)
}

export const updateLight = (id, l) => {
  return postAction(['lights', id], l, fetchLights)
}

export const deleteLight = (s) => {
  return deleteAction(['lights', s], fetchLights)
}

export const fetchLightUsage = (id) => {
  return getAction(['lights', id, 'usage'], lightUsageLoaded(id))
}
