import {reboot, powerOff, reload, reloaded, rebooted, powerOffed } from './admin.js'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

var storage = {}
window.localStorage = {
  getItem: (k) => {
    return storage[k]
  },
  setItem: (k, v) => {
    storage[k] = v
  }
}

describe('admin actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('reloaded', () => {
    expect(reloaded().type).toEqual('RELOADED')
  })

  it('reload', () => {
    fetchMock.postOnce('/api/admin/reload', {})
    const store = mockStore()
    return store.dispatch(reload()).then(() => {
      expect(store.getActions()).toEqual([reloaded()])
    })
  })

  it('rebooted', () => {
    expect(rebooted().type).toEqual('REBOOTED')
  })

  it('reboot', () => {
    fetchMock.postOnce('/api/admin/reboot', {})
    const store = mockStore()
    return store.dispatch(reboot()).then(() => {
      expect(store.getActions()).toEqual([rebooted()])
    })
  })

  it('powerOffed', () => {
    expect(powerOffed().type).toEqual('POWER_OFFED')
  })

  it('poweroff', () => {
    fetchMock.postOnce('/api/admin/poweroff', {})
    const store = mockStore()
    return store.dispatch(powerOff()).then(() => {
      expect(store.getActions()).toEqual([powerOffed()])
    })
  })
})
