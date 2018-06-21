import {equipmentsLoaded, fetchEquipments, deleteEquipment, createEquipment, updateEquipment} from './equipment'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import "isomorphic-fetch"
import {mockLocalStorage} from '../../utils/test_helper'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

window.localStorage = mockLocalStorage()

describe( 'equipment actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('equipmentsLoaded', ()=>{
    expect(equipmentsLoaded({}).type).toEqual('EQUIPMENTS_LOADED')
  })

  it('fetchEquipments', ()=>{
    fetchMock.getOnce('/api/equipments', {})
    const store = mockStore()
    return store.dispatch(fetchEquipments()).then(()=>{
      expect(store.getActions()).toEqual([equipmentsLoaded({})])
    })
  })

  it('deleteEquipment', ()=>{
    fetchMock.deleteOnce('/api/equipments/1', {})
    fetchMock.getOnce('/api/equipments', {})
    const store = mockStore()
    return store.dispatch(deleteEquipment('1')).then(()=>{
      expect(store.getActions()).toEqual([equipmentsLoaded({})])
    })
  })

  it('createEquipment', ()=>{
    fetchMock.putOnce('/api/equipments', {})
    fetchMock.getOnce('/api/equipments', {})
    const store = mockStore()
    return store.dispatch(createEquipment({})).then(()=>{
      expect(store.getActions()).toEqual([equipmentsLoaded({})])
    })
  })

  it('updateEquipment', ()=>{
    fetchMock.postOnce('/api/equipments/1', {})
    fetchMock.getOnce('/api/equipments', {})
    const store = mockStore()
    return store.dispatch(updateEquipment('1')).then(()=>{
      expect(store.getActions()).toEqual([equipmentsLoaded({})])
    })
  })
})
