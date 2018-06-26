import {fetchUIData } from './ui'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import "isomorphic-fetch"

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

var storage = {}
window.localStorage = {
  getItem: (k) => {
    return storage[k]
  },
  setItem: (k,v) =>{
    storage[k] = v
  }
}

describe( 'ui actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

 it('fetchUIData', ()=>{
   const caps = {
     ato: true,
     ph: true,
     temperature: true,
     lighting: true,
     equipment: false
   }
   fetchMock.getOnce('/api/capabilities', caps)
   fetchMock.getOnce('/api/atos', [])
   fetchMock.getOnce('/api/phprobes', [])
   fetchMock.getOnce('/api/tcs', [])
   fetchMock.getOnce('/api/lights', [])
   const store = mockStore()
   return store.dispatch(fetchUIData(store.dispatch)).then(()=>{
     expect(store.getActions()).not.toEqual([])
   })
 })
})

