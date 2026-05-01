import { getAction, postAction } from './api'

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
  return getAction('display', displayLoaded)
}

export const switchDisplay = (on) => {
  const action = on ? 'off' : 'on'
  return postAction(['display', action], {}, displaySwitched)
}

export const setBrightness = (b) => {
  return postAction('display', { brightness: b }, brightnessSet)
}
