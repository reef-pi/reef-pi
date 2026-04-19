import React, { act } from 'react'
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
  atos: [],
  dosers: [],
  journals: [],
  lights: [],
  light_usage: {},
  ato_usage: {},
  doser_usage: {},
  journal_usage: {},
  phprobes: [],
  ph_readings: {},
  tcs: [],
  tc_usage: {},
  sensors: [],
  health_stats: {},
  readings: []
}

describe('Dashboard', () => {
  const click = (node, event = {}) => {
    act(() => {
      node.prop('onClick')(event)
    })
  }

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
    fetchMock.get('/api/atos/1/usage', { historical: [] })
    fetchMock.get('/api/doser/pumps/1/usage', { historical: [] })
    fetchMock.get('/api/journal/1/usage', { historical: [] })
    fetchMock.get('/api/lights/1/usage', { current: [] })
    fetchMock.get('/api/phprobes/1/readings', { current: [], historical: [] })
    fetchMock.get('/api/tcs/1/usage', { current: [], historical: [] })
    fetchMock.get('/api/health_stats', {})
    fetchMock.get('/api/lights', [])
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
    const store = mockStore({
      ...childState,
      atos: [{ id: '1', name: 'ATO 1' }],
      dosers: [{ id: '1', name: 'Doser 1' }],
      journals: [{ id: '1', name: 'Journal 1', unit: 'ml' }],
      lights: [{ id: '1', name: 'Light 1', channels: { blue: { name: 'Blue', color: '#00f' } } }],
      light_usage: { 1: { current: [] } },
      ato_usage: { 1: { historical: [] } },
      phprobes: [{ id: '1', name: 'PH 1', chart: { color: '#00f', ymin: 0, ymax: 14, unit: 'pH' }, notify: { enable: false, min: 0, max: 0 } }],
      journal_usage: { 1: { historical: [] } },
      ph_readings: { 1: { current: [], historical: [] } },
      doser_usage: { 1: { historical: [] } },
      tcs: [{ id: '1', name: 'Temp 1', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true }],
      tc_usage: { 1: { current: [], historical: [] } },
      dashboard: config
    })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> renders temp_historical and default unknown types', () => {
    fetchMock.get('/api/dashboard', {})
    fetchMock.get('/api/tcs/1/usage', { current: [], historical: [] })
    const config = {
      row: 1,
      column: 2,
      width: 400,
      height: 200,
      grid_details: [
        [{ type: 'temp_historical', id: '1' }, { type: 'unknown_widget', id: '1' }]
      ]
    }
    const store = mockStore({
      ...childState,
      tcs: [{ id: '1', name: 'Temp 1', chart: { color: '#f00', ymin: 70, ymax: 90 }, fahrenheit: true }],
      tc_usage: { 1: { current: [], historical: [] } },
      dashboard: config
    })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> handleToggle switches to config view', () => {
    fetchMock.get('/api/dashboard', {})
    const config = { row: 1, column: 1, width: 400, height: 200, grid_details: [[]] }
    const store = mockStore({ ...childState, dashboard: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    click(wrapper.find('#configure-dashboard'))
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
