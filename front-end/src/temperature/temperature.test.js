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
    tcs: [{ id: '1', chart_min: 76, min: 72, max: 78, chart_max: 89 }],
    tc_usage: { '1': { historical: [{ cooler: 1 }], current: [] } }
  }
  it('<Main />', () => {
    let m = shallow(<Main store={mockStore(state)} />)
      .dive()
      .instance()
    m.props.createTC(1)
    m.props.deleteTC(1)
    m.props.updateTC(1, {})
    m = shallow(<Main store={mockStore({})} />)
      .dive()
      .instance()
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
    m.handleEdit({
      stopPropagation: () => {
        return true
      }
    })
    m.save(tc)
    tc.heater = ''
    tc.cooler = '3'
    m.save(tc)
    m.handleDelete({
      stopPropagation: () => {
        return true
      }
    })
  })

  it('<ReadingsChart />', () => {
    shallow(<ReadingsChart store={mockStore({ tcs: [], tc_usage: { '1': { current: [] } } })} sensor_id='1' />)
    let m = shallow(<ReadingsChart store={mockStore(state)} sensor_id='1' />)
      .dive()
      .instance()
    m.componentWillUnmount()
    delete m.state.timer
    m.componentWillUnmount()
    shallow(<ReadingsChart store={mockStore({ tcs: [], tc_usage: {} })} sensor_id='9' />)
      .dive()
      .instance()
    let stateCurrent = {
      tcs: [{ id: '1', chart_min: 76, min: 72, max: 78, chart_max: 89 }],
      tc_usage: { '1': { historical: [{ cooler: 1 }], current: [{ temperature: 1 }, { temperature: 4 }] } }
    }
    shallow(<ReadingsChart store={mockStore(stateCurrent)} sensor_id='1' />)
      .dive()
      .instance()
    stateCurrent = {
      tcs: [{ id: '2', chart_min: 76, min: 72, max: 78, chart_max: 89 }],
      tc_usage: { '1': { historical: [{ cooler: 1 }], current: [{ temperature: 1 }, { temperature: 4 }] } }
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
          tc_usage: { '1': { historical: [{ cooler: 1 }], current: [] } }
        })}
      />
    ).dive()
    let m = shallow(<ControlChart sensor_id='1' store={mockStore(state)} />)
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
