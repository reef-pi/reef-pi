import {
  instanceUpdated,
  instancesLoaded,
  instanceLoaded,
  fetchInstances,
  fetchInstance,
  createInstance,
  updateInstance,
  deleteInstance
} from './instances'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('instances actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('instanceUpdated returns correct type', () => {
    expect(instanceUpdated().type).toBe('INSTANCE_UPDATED')
  })

  it('instancesLoaded returns correct type and payload', () => {
    const action = instancesLoaded([])
    expect(action.type).toBe('INSTANCES_LOADED')
    expect(action.payload).toEqual([])
  })

  it('instanceLoaded returns correct type and payload', () => {
    const action = instanceLoaded({ id: '1' })
    expect(action.type).toBe('INSTANCE_LOADED')
    expect(action.payload).toEqual({ id: '1' })
  })

  it('fetchInstances dispatches instancesLoaded', () => {
    fetchMock.getOnce('/api/instances', [])
    const store = mockStore()
    return store.dispatch(fetchInstances()).then(() => {
      expect(store.getActions()).toEqual([instancesLoaded([])])
    })
  })

  it('fetchInstance dispatches instanceLoaded', () => {
    fetchMock.getOnce('/api/instances/1', { id: '1' })
    const store = mockStore()
    return store.dispatch(fetchInstance('1')).then(() => {
      expect(store.getActions()).toEqual([instanceLoaded({ id: '1' })])
    })
  })

  it('createInstance calls PUT then re-fetches', () => {
    fetchMock.putOnce('/api/instances', {})
    fetchMock.getOnce('/api/instances', [])
    const store = mockStore()
    return store.dispatch(createInstance({})).then(() => {
      expect(store.getActions()).toEqual([instancesLoaded([])])
    })
  })

  it('updateInstance calls POST then re-fetches', () => {
    fetchMock.postOnce('/api/instances/1', {})
    fetchMock.getOnce('/api/instances', [])
    const store = mockStore()
    return store.dispatch(updateInstance('1', {})).then(() => {
      expect(store.getActions()).toEqual([instancesLoaded([])])
    })
  })

  it('deleteInstance calls DELETE then re-fetches', () => {
    fetchMock.deleteOnce('/api/instances/1', {})
    fetchMock.getOnce('/api/instances', [])
    const store = mockStore()
    return store.dispatch(deleteInstance('1')).then(() => {
      expect(store.getActions()).toEqual([instancesLoaded([])])
    })
  })
})
