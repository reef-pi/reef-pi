import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ControlChart from './control_chart'
import Main from './main'
import New from './new'
import Notify from './notify'
import ReadingsChart from './readings_chart'
import Sensor from './sensor'
import SelectSensor from './select_sensor'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import {mockLocalStorage} from '../utils/test_helper'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Temperature controller ui', () => {
  const state = {
    tcs: [{id: '1', chart_min: 76, min: 72, max: 78, chart_max: 89}],
    tc_usage: {'1': {historical: [{cooler: 1}], current: []}}
  }
  it('<Main />', () => {
    shallow(<Main store={mockStore(state)} />).dive()
  })

  it('<New />', () => {
    const m = shallow(<New create={() => {}} />).instance()
    m.toggle()
    m.updateSensor('1')
    m.update('name')({target: {value: 'foo'}})
    m.updateCheckbox('foo')({target: {checked: true}})
    m.add()
  })

  it('<Notify />', () => {
    const m = shallow(<Notify config={{}} updateHook={() => {}} />).instance()
    m.update('foo')({target: {value: '1.21'}})
    m.updateEnable({target: {}})
  })

  it('<Sensor />', () => {
    const tc = {
      control: true,
      enable: true,
      min: 78,
      max: 81
    }
    const m = shallow(<Sensor data={tc} />).instance()
    m.save()
    m.expand()
    m.updateSensor({})
    m.updateNotify({})
    m.updateEquipment('foo')('var')
    m.update('foo')({target: {value: 'var'}})
    m.updateCheckBox('foo')({target: {checked: true}})
    m.showCharts()
    m.save()
  })

  it('<SelectSensor />', () => {
    const m = shallow(<SelectSensor sensors={['a']} update={() => true} />).instance()
    m.set('none')()
    m.set(0)()
  })

  it('<ReadingsChart />', () => {
    shallow(<ReadingsChart store={mockStore({tcs: [], tc_usage: {'1': {current: []}}})} sensor_id='1' />)
    shallow(<ReadingsChart store={mockStore(state)} sensor_id='1' />).dive()
  })

  it('<ControlChart />', () => {
    shallow(<ControlChart sensor_id='1' store={mockStore(state)} />).dive()
  })
})
