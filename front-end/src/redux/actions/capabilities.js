import { getAction } from './api'

export const capabilitiesLoaded = (capabilities) => {
  const mandatoryCapabilities = {
    log: true
  }
  return ({
    type: 'CAPABILITIES_LOADED',
    payload: {
      ...capabilities,
      ...mandatoryCapabilities
    }
  })
}

export const fetchCapabilities = () => {
  return (
    getAction('capabilities', capabilitiesLoaded))
}
