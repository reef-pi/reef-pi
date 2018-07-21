import {configLoaded, latestImageLoaded, imagesLoaded, fetchConfig, updateConfig, takeImage, getLatestImage, listImages } from './camera'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import {mockLocalStorage} from '../../utils/test_helper'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

window.localStorage = mockLocalStorage()

describe('camera actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('configLoaded', () => {
    expect(configLoaded({}).type).toEqual('CAMERA_CONFIG_LOADED')
  })

  it('latestImageLoaded', () => {
    expect(latestImageLoaded({}).type).toEqual('LATEST_IMAGE_LOADED')
  })

  it('imagesLoaded', () => {
    expect(imagesLoaded({}).type).toEqual('IMAGES_LOADED')
  })

  it('fetchConfig', () => {
    fetchMock.getOnce('/api/camera/config', {})
    const store = mockStore()
    return store.dispatch(fetchConfig()).then(() => {
      expect(store.getActions()).toEqual([configLoaded({})])
    })
  })

  it('updateConfig', () => {
    fetchMock.postOnce('/api/camera/config', {})
    fetchMock.getOnce('/api/camera/config', {})
    const store = mockStore()
    return store.dispatch(updateConfig({})).then(() => {
      expect(store.getActions()).toEqual([configLoaded({})])
    })
  })

  it('takeImage', () => {
    fetchMock.postOnce('/api/camera/shoot', {})
    fetchMock.getOnce('/api/camera/images', {})
    const store = mockStore()
    return store.dispatch(takeImage()).then(() => {
      expect(store.getActions()).toEqual([imagesLoaded({})])
    })
  })

  it('listImages', () => {
    fetchMock.getOnce('/api/camera/images', {})
    const store = mockStore()
    return store.dispatch(listImages()).then(() => {
      expect(store.getActions()).toEqual([imagesLoaded({})])
    })
  })

  it('getLatestImage', () => {
    fetchMock.getOnce('/api/camera/latest', {})
    const store = mockStore()
    return store.dispatch(getLatestImage()).then(() => {
      expect(store.getActions()).toEqual([latestImageLoaded({})])
    })
  })
})
