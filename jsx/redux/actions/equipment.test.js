import {
  equipmentLoaded,
  equipmentUpdated,
  fetchEquipment,
  deleteEquipment,
  createEquipment,
  updateEquipment
} from './equipment'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('equipment actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('equipmentLoaded', () => {
    expect(equipmentLoaded({}).type).toEqual('EQUIPMENTS_LOADED')
  })

  it('fetchEquipment', () => {
    fetchMock.getOnce('/api/equipment', {})
    const store = mockStore()
    return store.dispatch(fetchEquipment()).then(() => {
      expect(store.getActions()).toEqual([equipmentLoaded({})])
    })
  })

  it('deleteEquipment', () => {
    fetchMock.deleteOnce('/api/equipment/1', {})
    fetchMock.getOnce('/api/equipment', {})
    const store = mockStore()
    return store.dispatch(deleteEquipment('1')).then(() => {
      expect(store.getActions()).toEqual([equipmentLoaded({})])
    })
  })

  it('createEquipment', () => {
    fetchMock.putOnce('/api/equipment', {})
    fetchMock.getOnce('/api/equipment', {})
    const store = mockStore()
    return store.dispatch(createEquipment({})).then(() => {
      expect(store.getActions()).toEqual([equipmentLoaded({})])
    })
  })

  it('updateEquipment', () => {
    fetchMock.postOnce('/api/equipment/1', {})
    fetchMock.getOnce('/api/equipment', {})
    const store = mockStore()
    return store.dispatch(updateEquipment('1')).then(() => {
      expect(store.getActions()).toEqual([equipmentLoaded({})])
    })
  })
})
