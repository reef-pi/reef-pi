import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import PhForm from './ph_form'
import Chart from './chart'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
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
    m.handleToggleAddProbeDiv()

    m.handleCreateProbe({ name: 'test', type: 'reminder' })
    m.handleUpdateProbe({ id: '1', name: 'test', type: 'equipment' })
    m.calibrateProbe({ stopPropagation: jest.fn() }, { id: 1 })
    m.handleDeleteProbe('1')
  })

  it('<PhForm/> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<PhForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<PhForm /> for edit', () => {
    const fn = jest.fn()

    // *** added chart_y_min, chart_y_max - JFR 20201111
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

    // *** added chart_y_min, chart_y_max - JFR 20201111
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

    // *** added chart_y_min, chart_y_max - JFR 20201111
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
    expect(wrapper.props().value.values.control).toBe('nothing')
  })

  it('<Chart />', () => {
    const probes = [{ id: '1', name: 'foo' , chart: {}}]
    const readings = { 1: { name: 'foo', current: [] } }
    const m = shallow(
      <Chart probe_id='1' store={mockStore({ phprobes: probes, ph_readings: readings })} type='current' />
    )
      .dive()
      .instance()
    m.state.ph_readings = [{ ph: 6 }, { ph: 7 }]
    m.render()
    m.componentWillUnmount()
    shallow(<Chart probe_id='1' store={mockStore({ phprobes: [], ph_readings: readings })} type='current' />)
      .dive()
      .instance()
    shallow(<Chart probe_id='1' store={mockStore({ phprobes: probes, ph_readings: [] })} type='current' />)
      .dive()
      .instance()
  })
})
