import { reduxGet } from '../../utils/ajax'

export const capabilitiesLoaded = (capabilities) => {
  const MandatoryCapabilities = {
    log: true
  }
  return ({
    type: 'CAPABILITIES_LOADED',
    payload: Object.assign(capabilities, MandatoryCapabilities)
  })
}

export const fetchCapabilities = () => {
  return (
    reduxGet({
      url: '/api/capabilities',
      success: capabilitiesLoaded
    }))
}
