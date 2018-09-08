import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Calibrate from './calibrate'
import Chart from './chart'
import Main from './main'
import New from './new'
import Notify from './notify'
import Probe from './probe'
import ProbeConfig from './probe_config'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import {mockLocalStorage} from '../utils/test_helper'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('pH ui', () => {
  it('<Main />', () => {
    const probes = [{id: '1', name: 'foo'}]
    shallow(<Main store={mockStore({phprobes: probes})} />).dive()
  })

  it('<New />', () => {
    const m = shallow(<New hook={() => {}} />).instance()
    m.update('name')({target: {value: 'Foo'}})
    m.updateEnable({target: {checked: true}})
    m.add()
  })

  it('<Chart />', () => {
    const probes = [{id: '1', name: 'foo'}]
    const readings = {'1': { name: 'foo', current: [] }}
    shallow(
      <Chart
        probe_id='1'
        store={mockStore({phprobes: probes, ph_readings: readings})}
        type='current'
      />
    ).dive()
  })

  it('<Notify />', () => {
    const m = shallow(<Notify hook={() => {}} data={{}} />).instance()
    m.updateEnable()
    m.update('foo')({target: {}})
  })

  it('<Probe />', () => {
    const probe = {
      config: {
        notify: {min: 72, max: 87}
      }
    }
    const m = shallow(<Probe store={mockStore()} data={probe} />).dive().instance()
    m.edit()
    m.calibrate()
    m.updateConfig(probe.config)
    m.update('name')({target: {value: 'foo'}})
    m.updateEnable({target: {checked: true}})
    m.edit()
    m.remove()
  })

  it('<ProbeConfig />', () => {
    const m = shallow(<ProbeConfig hook={() => {}} data={{}} />).instance()
    m.updateConfig({})
  })

  it('<Calibrate />', () => {
    const m = shallow(<Calibrate hook={() => {}} />).instance()
    m.setType('foo')
    m.updateValue({target: {value: '1.2'}})
    m.calibrate()
  })
})
