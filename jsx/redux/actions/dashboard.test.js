import {dashboardLoaded, fetchDashboard, dashboardUpdated, updateDashboard } from './dashboard'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)


describe('dashboard actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('dashboardLoaded', () => {
    expect(dashboardLoaded({}).type).toEqual('DASHBOARD_LOADED')
  })

  it('dashboardUpdated', () => {
    expect(dashboardUpdated({}).type).toEqual('DASHBOARD_UPDATED')
  })

  it('fetchDashboard', () => {
    fetchMock.getOnce('/api/dashboard', {})
    const store = mockStore()
    return store.dispatch(fetchDashboard({})).then(() => {
      expect(store.getActions()).toEqual([dashboardLoaded({})])
    })
  })

  it('updateDashboard', () => {
    fetchMock.postOnce('/api/dashboard', {})
    const store = mockStore()
    return store.dispatch(updateDashboard({})).then(() => {
      expect(store.getActions()).toEqual([dashboardUpdated({})])
    })
  })
})
