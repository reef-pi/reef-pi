import { reduxGet } from '../../utils/ajax'

export const capabilitiesLoaded = (capabilities) => {
  return ({
    type: 'CAPABILITIES_LOADED',
    payload: capabilities
  })
}

export const fetchCapabilities = () => {
  return (
    reduxGet({
      url: '/api/capabilities',
      success: capabilitiesLoaded
    }))
}
