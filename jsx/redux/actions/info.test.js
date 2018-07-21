import {infoLoaded, fetchInfo} from './info'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import {mockLocalStorage} from '../../utils/test_helper'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

window.localStorage = mockLocalStorage()

describe('info actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('infoLoaded', () => {
    expect(infoLoaded({}).type).toEqual('INFO_LOADED')
  })

  it('fetchInfo', () => {
    fetchMock.getOnce('/api/info', {})
    const store = mockStore()
    return store.dispatch(fetchInfo()).then(() => {
      expect(store.getActions()).toEqual([infoLoaded({})])
    })
  })
})
