import { errorsLoaded, fetchErrors, deleteError, deleteErrors } from './errors'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('errors actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('errorsLoaded returns correct type and payload', () => {
    const action = errorsLoaded([{ id: 1 }])
    expect(action.type).toBe('ERRORS_LOADED')
    expect(action.payload).toEqual([{ id: 1 }])
  })

  it('fetchErrors dispatches errorsLoaded', () => {
    fetchMock.getOnce('/api/errors', [])
    const store = mockStore()
    return store.dispatch(fetchErrors()).then(() => {
      expect(store.getActions()).toEqual([errorsLoaded([])])
    })
  })

  it('deleteError calls DELETE then re-fetches', () => {
    fetchMock.deleteOnce('/api/errors/1', {})
    fetchMock.getOnce('/api/errors', [])
    const store = mockStore()
    return store.dispatch(deleteError('1')).then(() => {
      expect(store.getActions()).toEqual([errorsLoaded([])])
    })
  })

  it('deleteErrors calls DELETE on clear then re-fetches', () => {
    fetchMock.deleteOnce('/api/errors/clear', {})
    fetchMock.getOnce('/api/errors', [])
    const store = mockStore()
    return store.dispatch(deleteErrors()).then(() => {
      expect(store.getActions()).toEqual([errorsLoaded([])])
    })
  })
})
