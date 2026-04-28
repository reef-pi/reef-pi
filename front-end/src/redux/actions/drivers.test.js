import {
  driversLoaded,
  driverOptionsLoaded,
  fetchDrivers,
  fetchDriverOptions,
  deleteDriver,
  createDriver,
  updateDriver
} from './drivers'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('drivers actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('driversLoaded returns correct type and payload', () => {
    const action = driversLoaded([])
    expect(action.type).toBe('DRIVERS_LOADED')
    expect(action.payload).toEqual([])
  })

  it('driverOptionsLoaded returns correct type and payload', () => {
    const action = driverOptionsLoaded({ rpi: true })
    expect(action.type).toBe('DRIVER_OPTIONS_LOADED')
    expect(action.payload).toEqual({ rpi: true })
  })

  it('fetchDrivers dispatches driversLoaded', () => {
    fetchMock.getOnce('/api/drivers', [])
    const store = mockStore()
    return store.dispatch(fetchDrivers()).then(() => {
      expect(store.getActions()).toEqual([driversLoaded([])])
    })
  })

  it('fetchDriverOptions dispatches driverOptionsLoaded', () => {
    fetchMock.getOnce('/api/drivers/options', {})
    const store = mockStore()
    return store.dispatch(fetchDriverOptions()).then(() => {
      expect(store.getActions()).toEqual([driverOptionsLoaded({})])
    })
  })

  it('createDriver calls PUT then re-fetches', () => {
    fetchMock.putOnce('/api/drivers', {})
    fetchMock.getOnce('/api/drivers', [])
    const store = mockStore()
    return store.dispatch(createDriver({ name: 'rpi' })).then(() => {
      expect(store.getActions()).toEqual([driversLoaded([])])
    })
  })

  it('updateDriver calls POST then re-fetches', () => {
    fetchMock.postOnce('/api/drivers/1', {})
    fetchMock.getOnce('/api/drivers', [])
    const store = mockStore()
    return store.dispatch(updateDriver('1', {})).then(() => {
      expect(store.getActions()).toEqual([driversLoaded([])])
    })
  })

  it('deleteDriver calls DELETE then re-fetches', () => {
    fetchMock.deleteOnce('/api/drivers/1', {})
    fetchMock.getOnce('/api/drivers', [])
    const store = mockStore()
    return store.dispatch(deleteDriver('1')).then(() => {
      expect(store.getActions()).toEqual([driversLoaded([])])
    })
  })
})
