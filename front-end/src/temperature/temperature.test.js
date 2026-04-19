import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import ControlChart from './control_chart'
import Main from './main'
import ReadingsChart from './readings_chart'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import thunk from 'redux-thunk'
import TemperatureForm from './temperature_form'

const mockStore = configureMockStore([thunk])
jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
  }
})

const tcState = {
  tcs: [{ id: '1', name: 'Water', chart: {}, enable: false, notify: { enable: false } }],
  tc_usage: {},
  tc_reading: [],
  tc_sensors: [],
  analog_inputs: [],
  equipment: [],
  macros: []
}

describe('Temperature controller ui', () => {
  const state = {
    tcs: [{ id: '1', name: 'Water', chart:{} }, { id: '2', name: 'Air', chart:{} } ],
    tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } },
    tc_reading: [],
    equipment: [{ id: '1', name: 'bar', on: false }],
    macros: [{id: '1', name: 'macro'}]
  }

  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty tcs', () => {
    fetchMock.get('/api/tcs', [])
    fetchMock.get('/api/tcs/sensors', [])
    fetchMock.get('/api/equipment', [])
    fetchMock.get('/api/analog_inputs', [])
    const store = mockStore({ tcs: [], tc_reading: [], tc_usage: {}, tc_sensors: [], analog_inputs: [], equipment: [], macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with tcs', () => {
    fetchMock.get('/api/tcs', tcState.tcs)
    fetchMock.get('/api/tcs/sensors', [])
    fetchMock.get('/api/equipment', [])
    fetchMock.get('/api/analog_inputs', [])
    fetchMock.get('/api/tcs/1/read', { temperature: 77 })
    const store = mockStore(tcState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper.find('ul.list-group').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('<Main /> toggles add probe form', () => {
    fetchMock.get('/api/tcs', [])
    fetchMock.get('/api/tcs/sensors', [])
    fetchMock.get('/api/equipment', [])
    fetchMock.get('/api/analog_inputs', [])
    const store = mockStore({ tcs: [], tc_reading: [], tc_usage: {}, tc_sensors: [], analog_inputs: [], equipment: [], macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#add_probe').simulate('click')
    wrapper.find('#add_probe').simulate('click')
    wrapper.unmount()
  })

  it('<Main /> delete tc triggers confirm', () => {
    fetchMock.get('/api/tcs', [])
    fetchMock.get('/api/tcs/sensors', [])
    fetchMock.get('/api/equipment', [])
    fetchMock.get('/api/analog_inputs', [])
    fetchMock.get('/api/tcs/1/read', { temperature: 77 })
    fetchMock.delete('/api/tcs/1', {})
    const store = mockStore(tcState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#delete-panel-temperature-1').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> calibrate button opens wizard', () => {
    fetchMock.get('/api/tcs', [])
    fetchMock.get('/api/tcs/sensors', [])
    fetchMock.get('/api/equipment', [])
    fetchMock.get('/api/analog_inputs', [])
    fetchMock.get('/api/tcs/1/read', { temperature: 77 })
    const store = mockStore(tcState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('button[name="calibrate-probe-1"]').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main />', () => {
    let wrapper = shallow(<Main store={mockStore(state)} />)
      .dive().instance()

  })

  it('<ReadingsChart />', () => {
    shallow(<ReadingsChart store={mockStore({ tcs: [], tc_usage: { 1: { current: [] } } })} sensor_id='1' />)
    const m = shallow(<ReadingsChart store={mockStore(state)} sensor_id='1' />)
      .dive()
      .instance()
    shallow(<ReadingsChart store={mockStore({ tcs: [], tc_usage: {} })} sensor_id='9' />)
      .dive()
      .instance()
    let stateCurrent = {
      tcs: [{ id: '1', min: 72, max: 78, chart: {}}],
      tc_usage: { 1: { historical: [{ cooler: 1 }], current: [{ temperature: 1 }, { temperature: 4 }] } }
    }
    shallow(<ReadingsChart store={mockStore(stateCurrent)} sensor_id='1' />)
      .dive()
      .instance()
    stateCurrent = {
      tcs: [{ id: '2', min: 72, max: 78, chart:{}}],
      tc_usage: { 1: { historical: [{ cooler: 1 }], current: [{ temperature: 1 }, { temperature: 4 }] } }
    }
    shallow(<ReadingsChart store={mockStore(stateCurrent)} sensor_id='1' />)
      .dive()
      .instance()
  })

  it('<ControlChart />', () => {
    shallow(
      <ControlChart
        sensor_id='1'
        store={mockStore({
          tcs: [{ id: '1', min: 72, max: 78, chart:{} }],
          tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } }
        })}
      />
    ).dive()
    const m = shallow(<ControlChart sensor_id='1' store={mockStore(state)} />)
      .dive()
      .instance()
    shallow(<ControlChart sensor_id='1' store={mockStore({ tcs: [], tc_usage: [] })} />)
      .dive()
      .instance()
    shallow(<ControlChart sensor_id='1' store={mockStore({ tcs: [{ id: '1', min: 72, max: 78 }], tc_usage: [] })} />)
      .dive()
      .instance()
  })

  it('<TemperatureForm /> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<TemperatureForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<TemperatureForm /> for edit', () => {
    const fn = jest.fn()

    const tc = {
      id: '4',
      name: 'name',
      sensor: 'sensor',
      enable: true,
      control: false,
      is_macro: false,
      min: 70,
      max: 85,
      notify: {
        enable: true,
        min: 70,
        max: 90
      }
    }
    const wrapper = shallow(<TemperatureForm tc={tc} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<TemperatureForm /> for edit with macro', () => {
    const fn = jest.fn()

    const tc = {
      id: '4',
      name: 'name',
      sensor: 'sensor',
      control: true,
      is_macro: true,
      min: 70,
      max: 85,
      notify: {
        enable: true,
        min: 70,
        max: 90
      }
    }
    const wrapper = shallow(<TemperatureForm tc={tc} onSubmit={fn} />).dive()
    expect(wrapper.props().value.values.control).toBe('macro')
  })

  it('<TemperatureForm /> for edit with equipment', () => {
    const fn = jest.fn()

    const tc = {
      id: '4',
      name: 'name',
      sensor: 'sensor',
      enable: true,
      control: true,
      is_macro: false,
      min: 70,
      max: 85,
      notify: {
        enable: true,
        min: 70,
        max: 90
      }
    }
    const wrapper = shallow(<TemperatureForm tc={tc} onSubmit={fn} />).dive()
    expect(wrapper.props().value.values.control).toBe('equipment')
  })

})
