import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ControlChart from './control_chart'
import Main from './main'
import New from './new'
import ReadingsChart from './readings_chart'
import Sensor from './sensor'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import BooleanSelect from './boolean_select'
import TemperatureForm from './temperature_form'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Temperature controller ui', () => {
  const state = {
    tcs: [{ id: '1', chart_min: 76, min: 72, max: 78, chart_max: 89 }],
    tc_usage: { '1': { historical: [{ cooler: 1 }], current: [] } }
  }
  it('<Main />', () => {
    shallow(<Main store={mockStore(state)} />).dive()
  })

  it('<New />', () => {
    const fn = () => {}
    const sensors = []
    const equipment = []
    const tc = { name: 'test', enable: true, sensor: 'sensor1' }

    const m = shallow(<New create={fn} sensors={sensors} equipment={equipment} />).instance()
    m.toggle()
    m.add(tc)
  })

  it('<Sensor />', () => {
    const tc = {
      control: true,
      enable: true,
      min: 78,
      max: 81
    }
    const fn = () => {}
    const m = shallow(<Sensor data={tc} save={fn} sensors={[]} equipment={[]} remove={fn} />).instance()
    m.save(tc)
    m.expand()
    m.save(tc)
  })

  it('<ReadingsChart />', () => {
    shallow(<ReadingsChart store={mockStore({ tcs: [], tc_usage: { '1': { current: [] } } })} sensor_id="1" />)
    shallow(<ReadingsChart store={mockStore(state)} sensor_id="1" />).dive()
  })

  it('<ControlChart />', () => {
    let m = shallow(<ControlChart sensor_id="1" store={mockStore(state)} />)
      .dive()
      .instance()
    m.state.timer = window.setInterval(() => {
      return true
    }, 10 * 1000)
    m.componentWillUnmount()
    shallow(<ControlChart sensor_id="1" store={mockStore({ tcs: [], tc_usage: [] })} />)
      .dive()
      .instance()
    shallow(
      <ControlChart
        sensor_id="1"
        store={mockStore({ tcs: [{ id: '1', chart_min: 76, min: 72, max: 78, chart_max: 89 }], tc_usage: [] })}
      />
    )
      .dive()
      .instance()
  })

  it('<BooleanSelect /> should bind true', () => {
    let val = ''
    const field = {
      name: 'name',
      onChange: e => {
        val = e.target.value
      }
    }
    const wrapper = shallow(
      <BooleanSelect field={field}>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </BooleanSelect>
    )
    wrapper.find('select').simulate('change', { target: { value: 'true' } })
    expect(val).toBe(true)
  })

  it('<BooleanSelect /> should bind false', () => {
    let val = ''
    const field = {
      name: 'name',
      onChange: e => {
        val = e.target.value
      }
    }
    const wrapper = shallow(
      <BooleanSelect field={field}>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </BooleanSelect>
    )
    wrapper.find('select').simulate('change', { target: { value: 'false' } })
    expect(val).toBe(false)
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
})
