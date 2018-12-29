import {reduxGet} from '../../utils/ajax'

export const driversLoaded = (s) => {
  return ({
    type: 'DRIVERS_LOADED',
    payload: s
  })
}

export const fetchDrivers = () => {
  return (reduxGet({
    url: '/api/drivers',
    success: driversLoaded
  }))
}
