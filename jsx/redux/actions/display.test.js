import {displayLoaded, displaySwitched, brightnessSet, fetchDisplay, switchDisplay, setBrightness} from './display'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)


describe('display actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('displayLoaded', () => {
    expect(displayLoaded({}).type).toEqual('DISPLAY_LOADED')
  })

  it('displaySwitched', () => {
    expect(displaySwitched({}).type).toEqual('DISPLAY_SWITCHED')
  })

  it('brightnessSet', () => {
    expect(brightnessSet({}).type).toEqual('BRIGHTNESS_SET')
  })

  it('fetchDisplay', () => {
    fetchMock.getOnce('/api/display', {})
    const store = mockStore()
    return store.dispatch(fetchDisplay({})).then(() => {
      expect(store.getActions()).toEqual([displayLoaded({})])
    })
  })

  it('switchDisplay', () => {
    fetchMock.postOnce('/api/display/on', {})
    const store = mockStore()
    return store.dispatch(switchDisplay(false)).then(() => {
      expect(store.getActions()).toEqual([displaySwitched({})])
    })
  })

  it('setBrightness', () => {
    fetchMock.postOnce('/api/display', {})
    const store = mockStore()
    return store.dispatch(setBrightness(1)).then(() => {
      expect(store.getActions()).toEqual([brightnessSet({})])
    })
  })
})
