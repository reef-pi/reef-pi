import React from 'react'
import ComponentSelector from './component_selector'
import Config from './config'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import Grid from './grid'
import Main from './main'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

// Minimal store state so connected child components don't crash
const childState = {
  equipment: [],
  ato: [],
  dosers: [],
  journal: [],
  lights: [],
  ph: [],
  temperature: [],
  sensors: [],
  health: {},
  readings: []
}

describe('Dashboard', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('<Main /> smoke test via Provider (no config)', () => {
    fetchMock.get('/api/dashboard', {})
    const store = mockStore({ ...childState, dashboard: undefined })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> renders with empty grid_details', () => {
    fetchMock.get('/api/dashboard', {})
    const config = { row: 1, column: 1, width: 400, height: 200 }
    const store = mockStore({ ...childState, dashboard: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> renders all chart types (switch coverage)', () => {
    fetchMock.get('/api/dashboard', {})
    fetchMock.get('/api/equipment', [])
    fetchMock.get('/api/ato', [])
    fetchMock.get('/api/dosers', [])
    fetchMock.get('/api/lights', [])
    fetchMock.get('/api/ph/probes', [])
    fetchMock.get('/api/temperature/sensors', [])
    fetchMock.get('/api/health', {})
    const config = {
      row: 3,
      column: 4,
      width: 400,
      height: 200,
      grid_details: [
        [
          { type: 'lights', id: '1' },
          { type: 'equipment_barchart', id: '1' },
          { type: 'equipment_ctrlpanel', id: '1' },
          { type: 'blank_panel', id: '1' }
        ],
        [
          { type: 'ato', id: '1' },
          { type: 'journal', id: '1' },
          { type: 'ph_current', id: '1' },
          { type: 'ph_historical', id: '1' }
        ],
        [
          { type: 'ph_usage', id: '1' },
          { type: 'doser', id: '1' },
          { type: 'health', id: 'current' },
          { type: 'temp_current', id: '1' }
        ]
      ]
    }
    const store = mockStore({ ...childState, dashboard: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> renders temp_historical and default unknown types', () => {
    fetchMock.get('/api/dashboard', {})
    const config = {
      row: 1,
      column: 2,
      width: 400,
      height: 200,
      grid_details: [
        [{ type: 'temp_historical', id: '1' }, { type: 'unknown_widget', id: '1' }]
      ]
    }
    const store = mockStore({ ...childState, dashboard: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> handleToggle switches to config view', () => {
    fetchMock.get('/api/dashboard', {})
    const config = { row: 1, column: 1, width: 400, height: 200, grid_details: [[]] }
    const store = mockStore({ ...childState, dashboard: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#configure-dashboard').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> old shallow dive still works for smoke', () => {
    fetchMock.get('/api/dashboard', {})
    const config = { row: 1, column: 1, width: 400, height: 200 }
    const m = shallow(<Main store={mockStore({ dashboard: config })} />).dive()
    expect(m).toBeDefined()
  })

  it('<Grid />', () => {
    var cells = [
      [{ id: '1', type: 'light' }, { id: '2', type: 'light' }],
      [{ id: '1', type:'equipment' }, { id: '2',type: 'ato' }],
    ]
    const m = shallow(<Grid rows={2} columns={2} cells={cells} hook={() => {}} />).instance()
    m.setType(0, 0, 'equipment')()
    m.setID(0, 0)('1')
    m.menuItem('ato', true, 0, 1)
    m.render()
  })

  it('<ComponentSelector />', () => {
    const comps = {
      c1: { id: '1', name: 'foo' },
      c2: undefined
    }
    const m = shallow(<ComponentSelector hook={() => {}} components={comps} current_id='1' />).instance()
    m.setID(1, 'foo')({})
  })

  it('<Config />', () => {
    const cells = [[{ type: 'ato', id: '1' }]]
    const config = { row: 1, column: 1, grid_details: cells }
    const m = shallow(<Config store={mockStore({ dashboard: config })} />)
      .dive()
      .instance()
  })
})
