import { reduxPost } from '../../utils/ajax'

export const reloaded = () => {
  return ({
    type: 'RELOADED'
  })
}

export const reload = () => {
  return (
    reduxPost({
      url: '/api/admin/reload',
      success: reloaded,
      failure: () => {}
    }))
}

export const rebooted = () => {
  return ({
    type: 'REBOOTED'
  })
}

export const reboot = () => {
  return (
    reduxPost({
      url: '/api/admin/reboot',
      success: rebooted
    }))
}

export const powerOffed = () => {
  return ({
    type: 'POWER_OFFED'
  })
}

export const powerOff = () => {
  return (
    reduxPost({
      url: '/api/admin/poweroff',
      success: powerOffed,
      data: {}
    }))
}
