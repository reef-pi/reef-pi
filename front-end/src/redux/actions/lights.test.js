import {lightsLoaded, lightLoaded, fetchLights, fetchLight, createLight, deleteLight, updateLight} from './lights'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('jacks actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('lightsLoaded', () => {
    expect(lightsLoaded({}).type).toEqual('LIGHTS_LOADED')
  })

  it('lightLoaded', () => {
    expect(lightLoaded('1')({}).type).toEqual('LIGHT_LOADED')
  })

  it('fetchLights', () => {
    fetchMock.getOnce('/api/lights', {})
    const store = mockStore()
    return store.dispatch(fetchLights()).then(() => {
      expect(store.getActions()).toEqual([lightsLoaded({})])
    })
  })

  it('createLight', () => {
    fetchMock.putOnce('/api/lights', {})
    fetchMock.getOnce('/api/lights', {})
    const store = mockStore()
    return store.dispatch(createLight({})).then(() => {
      expect(store.getActions()).toEqual([lightsLoaded({})])
    })
  })

  it('updateLight', () => {
    fetchMock.postOnce('/api/lights/1', {})
    fetchMock.getOnce('/api/lights', {})
    const store = mockStore()
    return store.dispatch(updateLight('1')).then(() => {
      expect(store.getActions()).toEqual([lightsLoaded({})])
    })
  })

  it('deleteLight', () => {
    fetchMock.deleteOnce('/api/lights/1', {})
    fetchMock.getOnce('/api/lights', {})
    const store = mockStore()
    return store.dispatch(deleteLight('1')).then(() => {
      expect(store.getActions()).toEqual([lightsLoaded({})])
    })
  })
})
