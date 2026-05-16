import { fetchUIData } from './ui'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

let storage = {}
window.localStorage = {
  getItem: (k) => {
    return storage[k]
  },
  setItem: (k, v) => {
    storage[k] = v
  }
}

describe('ui actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('fetchUIData', () => {
    const caps = {
      ato: true,
      ph: true,
      temperature: true,
      lighting: true,
      equipment: false
    }
    fetchMock.getOnce('/api/capabilities', caps)
    fetchMock.getOnce('/api/info', {})
    fetchMock.getOnce('/api/atos', [])
    fetchMock.getOnce('/api/phprobes', [])
    fetchMock.getOnce('/api/tcs', [])
    fetchMock.getOnce('/api/lights', [])
    fetchMock.getOnce('/api/inlets', [])
    fetchMock.getOnce('/api/jacks', [])
    fetchMock.getOnce('/api/drivers', [])
    fetchMock.getOnce('/api/analog_inputs', [])
    fetchMock.getOnce('/api/outlets', [])
    fetchMock.getOnce('/api/errors', [])
    const store = mockStore()
    return store.dispatch(fetchUIData()).then(() => {
      expect(store.getActions()).not.toEqual([])
    })
  })

  it('fetchUIData fetches manager data when manager capability is enabled', () => {
    const caps = {
      manager: true
    }
    fetchMock.getOnce('/api/capabilities', caps)
    fetchMock.getOnce('/api/instances', [])
    const store = mockStore()
    return store.dispatch(fetchUIData()).then(() => {
      expect(fetchMock.called('/api/instances')).toBe(true)
      expect(store.getActions()).toContainEqual(expect.objectContaining({
        type: 'CAPABILITIES_LOADED',
        payload: expect.objectContaining(caps)
      }))
    })
  })

  it('fetchUIData dispatches all capability-gated fetches when all flags are true', () => {
    const caps = {
      ato: true,
      ph: true,
      temperature: true,
      lighting: true,
      equipment: true,
      doser: true,
      timers: true,
      macro: true,
      journal: true
    }
    fetchMock.getOnce('/api/capabilities', caps)
    fetchMock.getOnce('/api/info', {})
    fetchMock.getOnce('/api/atos', [])
    fetchMock.getOnce('/api/phprobes', [])
    fetchMock.getOnce('/api/tcs', [])
    fetchMock.getOnce('/api/lights', [])
    fetchMock.getOnce('/api/equipment', [])
    fetchMock.getOnce('/api/doser/pumps', [])
    fetchMock.getOnce('/api/timers', [])
    fetchMock.getOnce('/api/macros', [])
    fetchMock.getOnce('/api/journal', [])
    fetchMock.getOnce('/api/inlets', [])
    fetchMock.getOnce('/api/jacks', [])
    fetchMock.getOnce('/api/drivers', [])
    fetchMock.getOnce('/api/analog_inputs', [])
    fetchMock.getOnce('/api/outlets', [])
    fetchMock.getOnce('/api/errors', [])
    const store = mockStore()
    return store.dispatch(fetchUIData()).then(() => {
      expect(fetchMock.called('/api/equipment')).toBe(true)
      expect(fetchMock.called('/api/doser/pumps')).toBe(true)
      expect(fetchMock.called('/api/timers')).toBe(true)
      expect(fetchMock.called('/api/macros')).toBe(true)
      expect(fetchMock.called('/api/journal')).toBe(true)
    })
  })
})
