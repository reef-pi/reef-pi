import { lightsLoaded, lightLoaded, lightUsageLoaded, fetchLights, fetchLight, fetchLightUsage, createLight, deleteLight, updateLight } from './lights'
import { thunk } from 'redux-thunk'
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

  it('lightsLoaded converts lunar full moon dates', () => {
    const fullMoon = '2026-05-01T00:00:00Z'
    const lights = [{
      channels: [{
        profile: {
          type: 'lunar',
          config: { full_moon: fullMoon }
        }
      }, {
        profile: {
          type: 'fixed',
          config: { value: 50 }
        }
      }]
    }]

    const action = lightsLoaded(lights)

    expect(action.payload[0].channels[0].profile.config.full_moon).toBe(Date.parse(fullMoon))
    expect(action.payload[0].channels[1].profile.config.value).toBe(50)
  })

  it('lightLoaded', () => {
    expect(lightLoaded('1')({})).toEqual({
      type: 'LIGHT_LOADED',
      payload: { light: {}, id: '1' }
    })
  })

  it('lightUsageLoaded', () => {
    expect(lightUsageLoaded('1')({ total: 12 })).toEqual({
      type: 'LIGHT_USAGE_LOADED',
      payload: { usage: { total: 12 }, id: '1' }
    })
  })

  it('fetchLights', () => {
    fetchMock.getOnce('/api/lights', {})
    const store = mockStore()
    return store.dispatch(fetchLights()).then(() => {
      expect(store.getActions()).toEqual([lightsLoaded({})])
    })
  })

  it('fetchLight', () => {
    fetchMock.getOnce('/api/lights/1', { id: '1' })
    const store = mockStore()
    return store.dispatch(fetchLight('1')).then(() => {
      expect(store.getActions()).toEqual([lightLoaded('1')({ id: '1' })])
    })
  })

  it('fetchLightUsage', () => {
    fetchMock.getOnce('/api/lights/1/usage', { total: 12 })
    const store = mockStore()
    return store.dispatch(fetchLightUsage('1')).then(() => {
      expect(store.getActions()).toEqual([lightUsageLoaded('1')({ total: 12 })])
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
