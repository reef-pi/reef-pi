import {credsUpdated, updateCreds } from './creds'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import "isomorphic-fetch"
import {mockLocalStorage} from '../../utils/test_helper'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

window.localStorage = mockLocalStorage()

describe( 'creds actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('credsUpdated', ()=>{
    expect(credsUpdated({}).type).toEqual('CREDS_UPDATED')
  })

  it('updateCreds', ()=>{
    fetchMock.postOnce('/api/credentials', {})
    const store = mockStore()
    return store.dispatch(updateCreds({})).then(()=>{
      expect(store.getActions()).toEqual([credsUpdated({})])
    })
  })
})

