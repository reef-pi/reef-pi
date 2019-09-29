import { reduxGet, reduxPost, reduxPut, reduxDelete } from 'utils/ajax'

export const driversLoaded = (drivers) => {
  return ({
    type: 'DRIVERS_LOADED',
    payload: drivers
  })
}

export const fetchDrivers = () => {
  return (
    reduxGet({
      url: '/api/drivers',
      success: driversLoaded
    }))
}

export const fetchDriverOptions = ()  => {
  return (
    reduxGet({
      url: '/api/drivers/options',
      success: driverOptionsLoaded
    })
  )
}

export const deleteDriver = (id) => {
  return (
    reduxDelete({
      url: '/api/drivers/' + id,
      success: fetchDrivers
    }))
}

export const createDriver = (driver) => {
  return (
    reduxPut({
      url: '/api/drivers',
      data: driver,
      success: fetchDrivers
    }))
}

export const updateDriver = (id, driver) => {
  return (
    reduxPost({
      url: '/api/drivers/' + id,
      data: driver,
      success: fetchDrivers
    }))
}

export const driverOptionsLoaded = (options) => {
  return ({
    type: 'DRIVER_OPTIONS_LOADED',
    payload: options
  })
}
