import {
  telemetryLoaded,
  testMessageSent,
  fetchTelemetry,
  updateTelemetry,
  sendTestMessage
} from './telemetry'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('telemetry actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('telemetryLoaded returns correct type and payload', () => {
    const config = { host: 'mqtt.local' }
    const action = telemetryLoaded(config)
    expect(action.type).toBe('TELEMETRY_LOADED')
    expect(action.payload).toBe(config)
  })

  it('testMessageSent returns correct type', () => {
    expect(testMessageSent().type).toBe('TELEMETRY_TEST_MESSAGE_SENT')
  })

  it('fetchTelemetry dispatches telemetryLoaded', () => {
    fetchMock.getOnce('/api/telemetry', { host: 'mqtt.local' })
    const store = mockStore()
    return store.dispatch(fetchTelemetry()).then(() => {
      expect(store.getActions()).toEqual([telemetryLoaded({ host: 'mqtt.local' })])
    })
  })

  it('updateTelemetry calls POST then re-fetches', () => {
    const config = { host: 'mqtt.local' }
    fetchMock.postOnce('/api/telemetry', {})
    fetchMock.getOnce('/api/telemetry', config)
    const store = mockStore()
    return store.dispatch(updateTelemetry(config)).then(() => {
      expect(store.getActions()).toEqual([telemetryLoaded(config)])
    })
  })

  it('sendTestMessage calls POST to test_message endpoint', () => {
    fetchMock.postOnce('/api/telemetry/test_message', {})
    const store = mockStore()
    return store.dispatch(sendTestMessage()).then(() => {
      expect(store.getActions()).toEqual([testMessageSent()])
    })
  })
})
