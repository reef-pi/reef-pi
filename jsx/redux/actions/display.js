import {reduxGet, reduxPost} from '../../utils/ajax'

export const displayLoaded = (s) => {
  return ({
    type: 'DISPLAY_LOADED',
    payload: s
  })
}

export const displaySwitched = () => {
  return ({
    type: 'DISPLAY_SWITCHED'
  })
}

export const brightnessSet = () => {
  return ({
    type: 'BRIGHTNESS_SET'
  })
}

export const fetchDisplay = () => {
  return (reduxGet({
    url: '/api/display',
    success: displayLoaded
  }))
}


export const switchDisplay = (on) => {
  var action = on ? 'off' : 'on'
  return (reduxPost({
    url: '/api/display/'+action,
    success: displaySwitched,
    data: {}
  }))
}

export const setBrightness = (b) => {
  return (reduxPost({
    url: '/api/display',
    success: brightnessSet,
    data:{brightness: b}
  }))
}
