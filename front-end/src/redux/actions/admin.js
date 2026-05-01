import { postAction } from './api'

export const reloaded = () => {
  return ({
    type: 'RELOADED'
  })
}

export const reload = () => {
  return (
    postAction(['admin', 'reload'], undefined, reloaded, { failure: () => {} }))
}

export const rebooted = () => {
  return ({
    type: 'REBOOTED'
  })
}

export const reboot = () => {
  return (
    postAction(['admin', 'reboot'], undefined, rebooted))
}

export const powerOffed = () => {
  return ({
    type: 'POWER_OFFED'
  })
}

export const powerOff = () => {
  return (
    postAction(['admin', 'poweroff'], {}, powerOffed))
}

export const dbImported = () => {
  return ({
    type: 'DB_IMPORTED'
  })
}

export const dbImport = (formData) => {
  return (
    postAction(['admin', 'reef-pi.db'], undefined, dbImported, { raw: formData }))
}

export const upgraded = () => {
  return ({
    type: 'UPGRADED'
  })
}

export const upgrade = (version) => {
  return (
    postAction(['admin', 'upgrade'], { version }, upgraded))
}
