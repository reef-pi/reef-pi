import {atosLoaded, fetchATOs, atoLoaded, fetchATO, atoUsageLoaded, fetchATOUsage, createATO, atoUpdated, updateATO, deleteATO } from './ato'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

var storage = {}
window.localStorage = {
  getItem: (k) => {
    return storage[k]
  },
  setItem: (k, v) => {
    storage[k] = v
  }
}

describe('ato actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('atosLoaded', () => {
    expect(atosLoaded({}).type).toEqual('ATOS_LOADED')
  })

  it('atoLoaded', () => {
    expect(atoLoaded({}).type).toEqual('ATO_LOADED')
  })

  it('atoUpdated', () => {
    expect(atoUpdated().type).toEqual('ATO_UPDATED')
  })

  it('atoUsageLoaded', () => {
    expect(atoUsageLoaded('1')().type).toEqual('ATO_USAGE_LOADED')
  })

  it('fetchATOs', () => {
    fetchMock.getOnce('/api/atos', {})
    const store = mockStore()
    return store.dispatch(fetchATOs()).then(() => {
      expect(store.getActions()).toEqual([{type: 'ATOS_LOADED', payload: {}}])
    })
  })

  it('fetchATO', () => {
    fetchMock.getOnce('/api/atos/1', {})
    const store = mockStore()
    return store.dispatch(fetchATO('1')).then(() => {
      expect(store.getActions()).toEqual([{type: 'ATO_LOADED', payload: {}}])
    })
  })

  it('fetchATOUsage', () => {
    fetchMock.getOnce('/api/atos/1/usage', {})
    const store = mockStore()
    return store.dispatch(fetchATOUsage('1')).then(() => {
      expect(store.getActions()).toEqual([{type: 'ATO_USAGE_LOADED', payload: {data: {}, id: '1'}}])
    })
  })

  it('createATO', () => {
    fetchMock.putOnce('/api/atos', {})
    fetchMock.getOnce('/api/atos', {})
    const store = mockStore()
    return store.dispatch(createATO({})).then(() => {
      expect(store.getActions()).toEqual([{type: 'ATOS_LOADED', payload: {}}])
    })
  })

  it('updateATO', () => {
    fetchMock.postOnce('/api/atos/1', {})
    const store = mockStore()
    return store.dispatch(updateATO('1', {})).then(() => {
      expect(store.getActions()).toEqual([{type: 'ATO_UPDATED'}])
    })
  })

  it('deleteATO', () => {
    fetchMock.deleteOnce('/api/atos/1', {})
    fetchMock.getOnce('/api/atos', {})
    const store = mockStore()
    return store.dispatch(deleteATO('1')).then(() => {
      expect(store.getActions()).toEqual([{type: 'ATOS_LOADED', payload: {}}])
    })
  })
})
