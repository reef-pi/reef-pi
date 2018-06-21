import {settingsLoaded, fetchSettings, settingsUpdated, updateSettings} from './settings'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import "isomorphic-fetch"
import {mockLocalStorage} from '../../utils/test_helper'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

window.localStorage = mockLocalStorage()

describe( 'settings actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('settingsLoaded', ()=>{
    expect(settingsLoaded({}).type).toEqual('SETTINGS_LOADED')
  })

  it('settingsUpdated', ()=>{
    expect(settingsUpdated({}).type).toEqual('SETTINGS_UPDATED')
  })

  it('fetchSettings', ()=>{
    fetchMock.getOnce('/api/settings', {})
    const store = mockStore()
    return store.dispatch(fetchSettings()).then(()=>{
      expect(store.getActions()).toEqual([settingsLoaded({})])
    })
  })

  it('updateSettings', ()=>{
    fetchMock.postOnce('/api/settings', {})
    const store = mockStore()
    return store.dispatch(updateSettings()).then(()=>{
      expect(store.getActions()).toEqual([settingsUpdated({})])
    })
  })
})
