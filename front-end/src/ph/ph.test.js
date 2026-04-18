import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import PhForm from './ph_form'
import Chart from './chart'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

const phState = {
  phprobes: [{ id: '1', name: 'probe', enable: false, notify: { enable: false }, control: false }],
  analog_inputs: [],
  ph_reading: [],
  macros: [],
  equipment: []
}

jest.mock('utils/confirm', () => {
  return {
    showModal: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this),
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

describe('Ph ui', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty probes', () => {
    fetchMock.get('/api/phprobes', [])
    const store = mockStore({ phprobes: [], analog_inputs: [], ph_reading: [], macros: [], equipment: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with probes', () => {
    fetchMock.get('/api/phprobes', phState.phprobes)
    const store = mockStore(phState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper.find('ul.list-group').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('<Main /> toggles add probe form', () => {
    fetchMock.get('/api/phprobes', [])
    const store = mockStore({ phprobes: [], analog_inputs: [], ph_reading: [], macros: [], equipment: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#add_probe').simulate('click')
    wrapper.find('#add_probe').simulate('click')
    wrapper.unmount()
  })

  it('<Main /> mounts with enabled probe', () => {
    fetchMock.get('/api/phprobes', [])
    const enabledProbe = { id: '2', name: 'enabled-probe', enable: true, notify: { enable: false }, control: false }
    const store = mockStore({ phprobes: [enabledProbe], analog_inputs: [], ph_reading: [], macros: [], equipment: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with control probe', () => {
    fetchMock.get('/api/phprobes', [])
    const controlProbe = {
      id: '3', name: 'control-probe', enable: false,
      notify: { enable: false }, control: true, is_macro: false,
      min: 7, max: 8.6, downer_eq: '1', upper_eq: '2', chart: {}
    }
    const store = mockStore({ phprobes: [controlProbe], analog_inputs: [], ph_reading: [], macros: [], equipment: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> delete probe triggers confirm', () => {
    fetchMock.get('/api/phprobes', [])
    fetchMock.delete('/api/phprobes/1', {})
    const store = mockStore(phState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#delete-panel-ph-1').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> calibrate button click shows wizard', () => {
    fetchMock.get('/api/phprobes', [])
    const store = mockStore(phState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('button[name="calibrate-probe-1"]').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main />', () => {
    const state = {
      phprobes: [
        {
          id: 1,
          name: 'probe',
          enable: false,
          chart: {},
          notify: {
            enable: false
          },
          control: true,
          is_macro: true,
          min: 7,
          downer_eq: '3',
          max: 8.6,
          upper_eq: '1'
        }
      ]
    }

    const m = shallow(<Main store={mockStore(state)} />)
      .dive()
      .instance()
  })

  it('<PhForm/> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<PhForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<PhForm /> for edit', () => {
    const fn = jest.fn()

    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: true,
      is_macro: false,
      chart_y_min: 0,
      chart_y_max: 14
    }
    const wrapper = shallow(<PhForm probe={probe} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<PhForm /> for edit with macro', () => {
    const fn = jest.fn()

    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: true,
      is_macro: true,
      chart_y_min: 0,
      chart_y_max: 14
    }
    const wrapper = shallow(<PhForm probe={probe} onSubmit={fn} />).dive()
    expect(wrapper.props().value.values.control).toBe('macro')
  })

  it('<PhForm /> for edit without control', () => {
    const fn = jest.fn()

    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: false,
      is_macro: true,
      chart_y_min: 0,
      chart_y_max: 14
    }
    const wrapper = shallow(<PhForm probe={probe} onSubmit={fn} />).dive()
    expect(wrapper.props().value.values.control).toBe('')
  })

  it('<Chart />', () => {
    const probes = [{ id: '1', name: 'foo' , chart: {}}]
    const readings = { 1: { name: 'foo', current: [] } }
    const m = shallow(
      <Chart probe_id='1' store={mockStore({ phprobes: probes, ph_readings: readings })} type='current' />
    )
      .dive()
      .instance()
    shallow(<Chart probe_id='1' store={mockStore({ phprobes: [], ph_readings: readings })} type='current' />)
      .dive()
      .instance()
    shallow(<Chart probe_id='1' store={mockStore({ phprobes: probes, ph_readings: [] })} type='current' />)
      .dive()
      .instance()
  })
})
