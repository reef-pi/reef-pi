import {inletsLoaded, fetchInlets, deleteInlet, createInlet} from './inlets'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('inlets actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('inletsLoaded', () => {
    expect(inletsLoaded({}).type).toEqual('INLETS_LOADED')
  })

  it('fetchInlets', () => {
    fetchMock.getOnce('/api/inlets', {})
    const store = mockStore()
    return store.dispatch(fetchInlets()).then(() => {
      expect(store.getActions()).toEqual([inletsLoaded({})])
    })
  })

  it('createInlet', () => {
    fetchMock.putOnce('/api/inlets', {})
    fetchMock.getOnce('/api/inlets', {})
    const store = mockStore()
    return store.dispatch(createInlet()).then(() => {
      expect(store.getActions()).toEqual([inletsLoaded({})])
    })
  })
  it('deleteInlet', () => {
    fetchMock.deleteOnce('/api/inlets/1', {})
    fetchMock.getOnce('/api/inlets', {})
    const store = mockStore()
    return store.dispatch(deleteInlet('1')).then(() => {
      expect(store.getActions()).toEqual([inletsLoaded({})])
    })
  })
})
