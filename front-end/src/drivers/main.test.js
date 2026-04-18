import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import Drivers from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'

const mockStore = configureMockStore([thunk])

const drivers = [
  { id: '1', name: 'RPI', type: 'rpi', config: {} },
  { id: '2', name: 'PCA', type: 'pca9685', config: {} }
]
const driverOptions = [{ name: 'pca9685', display: 'PCA9685' }]

describe('Drivers Main', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('mounts with empty drivers', () => {
    fetchMock.get('/api/drivers', [])
    fetchMock.get('/api/drivers/options', [])
    const store = mockStore({ drivers: [], driverOptions: [] })
    const wrapper = mount(<Provider store={store}><Drivers /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('mounts with drivers including rpi type (read_only)', () => {
    fetchMock.get('/api/drivers', drivers)
    fetchMock.get('/api/drivers/options', driverOptions)
    const store = mockStore({ drivers, driverOptions })
    const wrapper = mount(<Provider store={store}><Drivers /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('mounts with non-rpi driver', () => {
    fetchMock.get('/api/drivers', [])
    fetchMock.get('/api/drivers/options', driverOptions)
    const pcaOnly = [{ id: '2', name: 'PCA', type: 'pca9685', config: {} }]
    const store = mockStore({ drivers: pcaOnly, driverOptions })
    const wrapper = mount(<Provider store={store}><Drivers /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('shallow render without throwing with drivers', () => {
    const store = mockStore({ drivers, driverOptions })
    expect(() =>
      shallow(<Provider store={store}><Drivers /></Provider>)
    ).not.toThrow()
  })

  it('shallow render without throwing with empty list', () => {
    const store = mockStore({ drivers: [], driverOptions: [] })
    expect(() =>
      shallow(<Provider store={store}><Drivers /></Provider>)
    ).not.toThrow()
  })
})
