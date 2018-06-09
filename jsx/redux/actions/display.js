import {reduxGet, reduxPost} from '../../utils/ajax'

export const displayLoaded = (s) => {
  return ({
    type: 'DISPLAY_LOADED',
    payload: s
  })
}

export const fetchDisplay = () => {
  return (reduxGet({
    url: '/api/display',
    success: displayLoaded
  }))
}

export const displayUpdated = () => {
  return ({
    type: 'DISPLAY_UPDATED'
  })
}

export const updateDisplay = (s) => {
  return (reduxPost({
    url: '/api/display',
    success: displayUpdated,
    data: s
  }))
}
