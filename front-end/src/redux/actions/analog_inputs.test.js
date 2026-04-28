import {
  analogInputsLoaded,
  fetchAnalogInputs,
  deleteAnalogInput,
  createAnalogInput,
  updateAnalogInput
} from './analog_inputs'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('analog_inputs actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('analogInputsLoaded returns correct type and payload', () => {
    const action = analogInputsLoaded([])
    expect(action.type).toBe('ANALOG_INPUTS_LOADED')
    expect(action.payload).toEqual([])
  })

  it('fetchAnalogInputs dispatches analogInputsLoaded', () => {
    fetchMock.getOnce('/api/analog_inputs', [])
    const store = mockStore()
    return store.dispatch(fetchAnalogInputs()).then(() => {
      expect(store.getActions()).toEqual([analogInputsLoaded([])])
    })
  })

  it('createAnalogInput calls PUT then re-fetches', () => {
    fetchMock.putOnce('/api/analog_inputs', {})
    fetchMock.getOnce('/api/analog_inputs', [])
    const store = mockStore()
    return store.dispatch(createAnalogInput({ name: 'ph sensor' })).then(() => {
      expect(store.getActions()).toEqual([analogInputsLoaded([])])
    })
  })

  it('updateAnalogInput calls POST then re-fetches', () => {
    fetchMock.postOnce('/api/analog_inputs/1', {})
    fetchMock.getOnce('/api/analog_inputs', [])
    const store = mockStore()
    return store.dispatch(updateAnalogInput('1', {})).then(() => {
      expect(store.getActions()).toEqual([analogInputsLoaded([])])
    })
  })

  it('deleteAnalogInput calls DELETE then re-fetches', () => {
    fetchMock.deleteOnce('/api/analog_inputs/1', {})
    fetchMock.getOnce('/api/analog_inputs', [])
    const store = mockStore()
    return store.dispatch(deleteAnalogInput('1')).then(() => {
      expect(store.getActions()).toEqual([analogInputsLoaded([])])
    })
  })
})
