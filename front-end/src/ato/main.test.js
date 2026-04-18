import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const mockStore = configureMockStore([thunk])

const ato = {
  id: '1', name: 'Top-off', enable: true,
  inlet: 'inlet1', period: 60, debounce: 0,
  control: true, pump: { id: 'pump1' },
  sensor: { readings: [] }
}
const equipment = [{ id: 'pump1', name: 'ATO Pump' }]
const inlets = [{ id: 'inlet1', name: 'Float Switch' }]
const macros = []

const storeState = { atos: [ato], equipment, inlets, macros }

describe('ATO Main', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('smoke test via Provider shallow', () => {
    const store = mockStore(storeState)
    expect(() =>
      shallow(<Provider store={store}><Main /></Provider>)
    ).not.toThrow()
  })

  it('mounts with ATO list', () => {
    fetchMock.get('/api/atos', [ato])
    fetchMock.get('/api/equipment', equipment)
    fetchMock.get('/api/inlets', inlets)
    const store = mockStore(storeState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('mounts with empty ATO list', () => {
    fetchMock.get('/api/atos', [])
    fetchMock.get('/api/equipment', [])
    fetchMock.get('/api/inlets', [])
    const store = mockStore({ atos: [], equipment: [], inlets: [], macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('renders New sub-component for adding ATOs', () => {
    fetchMock.get('/api/atos', [ato])
    fetchMock.get('/api/equipment', equipment)
    fetchMock.get('/api/inlets', inlets)
    const store = mockStore(storeState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    // ATO main delegates add via New sub-component — just verify it renders
    expect(wrapper.find('ul.list-group').length).toBeGreaterThan(0)
    wrapper.unmount()
  })
})
