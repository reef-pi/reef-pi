import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ControlChart from './control_chart'
import Main from './main'
import ReadingsChart from './readings_chart'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import TemperatureForm from './temperature_form'

Enzyme.configure({ adapter: new Adapter() })
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
describe('Temperature controller ui', () => {
  const state = {
    tcs: [{ id: '1', name: 'Water', chart:{} }, { id: '2', name: 'Air', chart:{} } ],
    tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } },
    tc_reading: [],
    equipment: [{ id: '1', name: 'bar', on: false }],
    macros: [{id: '1', name: 'macro'}]
  }

  it('<Main />', () => {
    let wrapper = shallow(<Main store={mockStore(state)} />)
      .dive()

    let m = wrapper.instance()
    m.handleToggleAddProbeDiv()
    m.handleCreate({ name: 'test', chart: {} })
    m.handleUpdate({ id: '1', name: 'test',  chart: {} })
    m.handleCalibrate({ stopPropagation: jest.fn() }, { id: 1 })
    m.handleDelete('1')
  })

  it('<ReadingsChart />', () => {
    shallow(<ReadingsChart store={mockStore({ tcs: [], tc_usage: { 1: { current: [] } } })} sensor_id='1' />)
    const m = shallow(<ReadingsChart store={mockStore(state)} sensor_id='1' />)
      .dive()
      .instance()
    m.componentWillUnmount()
    delete m.state.timer
    m.componentWillUnmount()
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
          tcs: [{ id: '1', min: 72, max: 78 }],
          tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } }
        })}
      />
    ).dive()
    const m = shallow(<ControlChart sensor_id='1' store={mockStore(state)} />)
      .dive()
      .instance()
    m.state.timer = window.setInterval(() => {
      return true
    }, 10 * 1000)
    m.componentWillUnmount()
    delete m.state.timer
    m.componentWillUnmount()
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

    // *** added chart_y_min, chart_y_max - JFR 20201110
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
      },
      chart_y_min: 0,
      chart_y_max: 100
    }
    const wrapper = shallow(<TemperatureForm tc={tc} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<TemperatureForm /> for edit with macro', () => {
    const fn = jest.fn()

    // *** added chart_y_min, chart_y_max - JFR 20201110
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
      },
      chart_y_min: 0,
      chart_y_max: 100
    }
    const wrapper = shallow(<TemperatureForm tc={tc} onSubmit={fn} />).dive()
    expect(wrapper.props().value.values.control).toBe('macro')
  })

  it('<TemperatureForm /> for edit with equipment', () => {
    const fn = jest.fn()

    // *** added chart_y_min, chart_y_max - JFR 20201110
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
      },
      chart_y_min: 0,
      chart_y_max: 100
    }
    const wrapper = shallow(<TemperatureForm tc={tc} onSubmit={fn} />).dive()
    expect(wrapper.props().value.values.control).toBe('equipment')
  })

})
