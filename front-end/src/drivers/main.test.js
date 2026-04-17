import React from 'react'
import { shallow } from 'enzyme'
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
  })

  it('renders without throwing with drivers', () => {
    const store = mockStore({ drivers, driverOptions })
    expect(() =>
      shallow(<Provider store={store}><Drivers /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing with empty drivers list', () => {
    const store = mockStore({ drivers: [], driverOptions: [] })
    expect(() =>
      shallow(<Provider store={store}><Drivers /></Provider>)
    ).not.toThrow()
  })

  it('renders via dive with drivers', () => {
    fetchMock.get('/api/drivers', drivers)
    fetchMock.get('/api/drivers/options', driverOptions)
    const store = mockStore({ drivers, driverOptions })
    const wrapper = shallow(<Drivers store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive with empty drivers', () => {
    fetchMock.get('/api/drivers', [])
    fetchMock.get('/api/drivers/options', [])
    const store = mockStore({ drivers: [], driverOptions: [] })
    const wrapper = shallow(<Drivers store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive with multiple drivers including rpi type', () => {
    fetchMock.get('/api/drivers', drivers)
    fetchMock.get('/api/drivers/options', driverOptions)
    const store = mockStore({ drivers, driverOptions })
    const wrapper = shallow(<Drivers store={store} />).dive()
    expect(wrapper).toBeDefined()
  })
})
