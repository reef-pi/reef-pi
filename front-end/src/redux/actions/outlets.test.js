import { outletsLoaded, fetchOutlets, deleteOutlet, createOutlet } from './outlets'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('outlets actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('outletsLoaded', () => {
    expect(outletsLoaded({}).type).toEqual('OUTLETS_LOADED')
  })

  it('fetchOutlets', () => {
    fetchMock.getOnce('/api/outlets', {})
    const store = mockStore()
    return store.dispatch(fetchOutlets()).then(() => {
      expect(store.getActions()).toEqual([outletsLoaded({})])
    })
  })

  it('createOutlet', () => {
    fetchMock.putOnce('/api/outlets', {})
    fetchMock.getOnce('/api/outlets', {})
    const store = mockStore()
    return store.dispatch(createOutlet()).then(() => {
      expect(store.getActions()).toEqual([outletsLoaded({})])
    })
  })

  it('deleteOutlet', () => {
    fetchMock.deleteOnce('/api/outlets/1', {})
    fetchMock.getOnce('/api/outlets', {})
    const store = mockStore()
    return store.dispatch(deleteOutlet('1')).then(() => {
      expect(store.getActions()).toEqual([outletsLoaded({})])
    })
  })
})
