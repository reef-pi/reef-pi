import { getAction, postAction } from './api'

export const settingsLoaded = (s) => {
  return ({
    type: 'SETTINGS_LOADED',
    payload: s
  })
}

export const settingsUpdated = () => {
  return ({
    type: 'SETTINGS_UPDATED'
  })
}

export const fetchSettings = () => {
  return getAction('settings', settingsLoaded)
}

export const updateSettings = (s) => {
  return postAction('settings', s, settingsUpdated)
}
