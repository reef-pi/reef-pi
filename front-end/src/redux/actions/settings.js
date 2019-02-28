import {reduxGet, reduxPost} from '../../utils/ajax'

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
  return (reduxGet({
    url: '/api/settings',
    success: settingsLoaded
  }))
}

export const updateSettings = (s) => {
  return (reduxPost({
    url: '/api/settings',
    success: settingsUpdated,
    data: s
  }))
}
