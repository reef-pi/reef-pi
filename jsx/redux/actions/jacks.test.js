import {jacksLoaded, fetchJacks, deleteJack, createJack} from './jacks'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)


describe('jacks actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('jacksLoaded', () => {
    expect(jacksLoaded({}).type).toEqual('JACKS_LOADED')
  })

  it('fetchJacks', () => {
    fetchMock.getOnce('/api/jacks', {})
    const store = mockStore()
    return store.dispatch(fetchJacks()).then(() => {
      expect(store.getActions()).toEqual([jacksLoaded({})])
    })
  })

  it('createJack', () => {
    fetchMock.putOnce('/api/jacks', {})
    fetchMock.getOnce('/api/jacks', {})
    const store = mockStore()
    return store.dispatch(createJack({})).then(() => {
      expect(store.getActions()).toEqual([jacksLoaded({})])
    })
  })

  it('deleteJack', () => {
    fetchMock.deleteOnce('/api/jacks/1', {})
    fetchMock.getOnce('/api/jacks', {})
    const store = mockStore()
    return store.dispatch(deleteJack('1')).then(() => {
      expect(store.getActions()).toEqual([jacksLoaded({})])
    })
  })
})
