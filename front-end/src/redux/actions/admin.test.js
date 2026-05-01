import { reboot, powerOff, reload, reloaded, rebooted, powerOffed, dbImport, dbImported, upgrade, upgraded } from './admin'
import { thunk } from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

let storage = {}
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

  it('dbImported', () => {
    expect(dbImported().type).toEqual('DB_IMPORTED')
  })

  it('dbImport', () => {
    const formData = new window.FormData()
    fetchMock.postOnce('/api/admin/reef-pi.db', {})
    const store = mockStore()
    return store.dispatch(dbImport(formData)).then(() => {
      expect(store.getActions()).toEqual([dbImported()])
      expect(fetchMock.lastOptions('/api/admin/reef-pi.db').body).toBe(formData)
    })
  })

  it('upgraded', () => {
    expect(upgraded().type).toEqual('UPGRADED')
  })

  it('upgrade', () => {
    fetchMock.postOnce('/api/admin/upgrade', {})
    const store = mockStore()
    return store.dispatch(upgrade('1.2.3')).then(() => {
      expect(store.getActions()).toEqual([upgraded()])
    })
  })
})
