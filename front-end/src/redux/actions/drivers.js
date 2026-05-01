import { deleteAction, getAction, postAction, putAction } from './api'

export const driversLoaded = (drivers) => {
  return ({
    type: 'DRIVERS_LOADED',
    payload: drivers
  })
}

export const fetchDrivers = () => {
  return getAction('drivers', driversLoaded)
}

export const fetchDriverOptions = () => {
  return getAction(['drivers', 'options'], driverOptionsLoaded)
}

export const deleteDriver = (id) => {
  return deleteAction(['drivers', id], fetchDrivers)
}

export const createDriver = (driver) => {
  return putAction('drivers', driver, fetchDrivers)
}

export const updateDriver = (id, driver) => {
  return postAction(['drivers', id], driver, fetchDrivers)
}

export const driverOptionsLoaded = (options) => {
  return ({
    type: 'DRIVER_OPTIONS_LOADED',
    payload: options
  })
}

export const provisionDriver = (id) => {
  return postAction(['drivers', id, 'provision'], {}, fetchDrivers)
}
