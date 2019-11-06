import { tcsLoaded, sensorsLoaded, tcUsageLoaded, fetchTCs, createTC, updateTC, deleteTC, fetchSensors, fetchTCUsage } from './tcs'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('temperature controller actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('tcsLoaded', () => {
    expect(tcsLoaded({}).type).toEqual('TCS_LOADED')
  })

  it('sensorsLoaded', () => {
    expect(sensorsLoaded({}).type).toEqual('TC_SENSORS_LOADED')
  })

  it('tcUsageLoaded', () => {
    expect(tcUsageLoaded('1')({}).type).toEqual('TC_USAGE_LOADED')
  })

  it('fetchTCs', () => {
    fetchMock.getOnce('/api/tcs', {})
    const store = mockStore()
    return store.dispatch(fetchTCs()).then(() => {
      expect(store.getActions()).toEqual([tcsLoaded({})])
    })
  })

  it('fetchTCUsage', () => {
    fetchMock.getOnce('/api/tcs/1/usage', {})
    const store = mockStore()
    return store.dispatch(fetchTCUsage('1')).then(() => {
      expect(store.getActions()).toEqual([tcUsageLoaded('1')({})])
    })
  })

  it('fetchSensors', () => {
    fetchMock.getOnce('/api/tcs/sensors', {})
    const store = mockStore()
    return store.dispatch(fetchSensors()).then(() => {
      expect(store.getActions()).toEqual([sensorsLoaded({})])
    })
  })

  it('createTC', () => {
    fetchMock.putOnce('/api/tcs', {})
    fetchMock.getOnce('/api/tcs', {})
    const store = mockStore()
    return store.dispatch(createTC()).then(() => {
      expect(store.getActions()).toEqual([tcsLoaded({})])
    })
  })

  it('updateTC', () => {
    fetchMock.postOnce('/api/tcs/1', {})
    fetchMock.getOnce('/api/tcs', {})
    const store = mockStore()
    return store.dispatch(updateTC('1')).then(() => {
      expect(store.getActions()).toEqual([tcsLoaded({})])
    })
  })

  it('deleteTC', () => {
    fetchMock.deleteOnce('/api/tcs/1', {})
    fetchMock.getOnce('/api/tcs', {})
    const store = mockStore()
    return store.dispatch(deleteTC('1')).then(() => {
      expect(store.getActions()).toEqual([tcsLoaded({})])
    })
  })
})
