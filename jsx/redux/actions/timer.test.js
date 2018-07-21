import {timersLoaded, fetchTimers, createTimer, timerDeleted, deleteTimer} from './timer'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import {mockLocalStorage} from '../../utils/test_helper'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

window.localStorage = mockLocalStorage()

describe('timer actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('timersLoaded', () => {
    expect(timersLoaded({}).type).toEqual('TIMERS_LOADED')
  })

  it('timerDeleted', () => {
    expect(timerDeleted({}).type).toEqual('TIMER_DELETED')
  })

  it('fetchTimers', () => {
    fetchMock.getOnce('/api/timers', {})
    const store = mockStore()
    return store.dispatch(fetchTimers()).then(() => {
      expect(store.getActions()).toEqual([timersLoaded({})])
    })
  })

  it('createTimer', () => {
    fetchMock.putOnce('/api/timers', {})
    fetchMock.getOnce('/api/timers', {})
    const store = mockStore()
    return store.dispatch(createTimer({})).then(() => {
      expect(store.getActions()).toEqual([timersLoaded({})])
    })
  })

  it('deleteTimer', () => {
    fetchMock.deleteOnce('/api/timers/1', {})
    fetchMock.getOnce('/api/timers', {})
    const store = mockStore()
    return store.dispatch(deleteTimer('1')).then(() => {
      expect(store.getActions()).toEqual([timersLoaded({})])
    })
  })
})
