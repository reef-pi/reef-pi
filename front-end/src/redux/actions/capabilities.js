import { getAction } from './api'

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
    getAction('capabilities', capabilitiesLoaded))
}
