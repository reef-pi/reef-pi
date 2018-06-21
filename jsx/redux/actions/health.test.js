import {healthStatsLoaded, fetchHealth} from './health'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import "isomorphic-fetch"
import {mockLocalStorage} from '../../utils/test_helper'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

window.localStorage = mockLocalStorage()

describe( 'health actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('healthStatsLoaded', ()=>{
    expect(healthStatsLoaded({}).type).toEqual('HEALTH_STATS_LOADED')
  })

  it('fetchHealth', ()=>{
    fetchMock.getOnce('/api/health_stats', {})
    const store = mockStore()
    return store.dispatch(fetchHealth()).then(()=>{
      expect(store.getActions()).toEqual([healthStatsLoaded({})])
    })
  })
})
