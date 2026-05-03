import { capabilitiesLoaded, fetchCapabilities } from './capabilities'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('capabilities actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('capabilitiesLoaded', () => {
    const capabilities = { equipment: true }

    expect(capabilitiesLoaded(capabilities)).toEqual({
      type: 'CAPABILITIES_LOADED',
      payload: {
        equipment: true,
        log: true
      }
    })
    expect(capabilities).toEqual({ equipment: true })
  })

  it('fetchCapabilities', () => {
    fetchMock.getOnce('/api/capabilities', {})
    const store = mockStore()
    return store.dispatch(fetchCapabilities({})).then(() => {
      expect(store.getActions()).toEqual([capabilitiesLoaded({})])
    })
  })
})
