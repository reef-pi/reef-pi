import React from 'react'
import Enzyme, { shallow } from 'enzyme'
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

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
jest.mock('utils/confirm', () => {
  return {
    confirm: jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        return resolve(true)
      })
    })
  }
})
describe('pH ui', () => {
  it('<Main />', () => {
    const probes = [{ id: '1', name: 'foo' }]
    let m = shallow(<Main store={mockStore({ phprobes: probes })} />)
      .dive()
      .instance()
    m.props.createProbe({})
  })

  it('<New />', () => {
    const m = shallow(<New hook={() => {}} />).instance()
    m.update('name')({ target: { value: 'Foo' } })
    m.updateEnable({ target: { checked: true } })
    m.add()
    m.state.name = ''
    m.add()
  })

  it('<Chart />', () => {
    const probes = [{ id: '1', name: 'foo' }]
    const readings = { '1': { name: 'foo', current: [] } }
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

  it('<Notify />', () => {
    const m = shallow(<Notify hook={() => {}} data={{}} />).instance()
    m.updateEnable()
    m.update('foo')({ target: {} })
  })

  it('<Probe />', () => {
    const probe = {
      config: {
        notify: { min: 72, max: 87 }
      }
    }
    const m = shallow(<Probe store={mockStore()} data={probe} />)
      .dive()
      .instance()
    m.props.calibrateProbe(1, {})
    m.edit()
    m.calibrate()
    m.updateConfig(probe.config)
    m.update('name')({ target: { value: 'foo' } })
    m.updateEnable({ target: { checked: true } })
    m.edit()
    m.remove()
    m.expand()
    m.state.enable = true
    m.chart()
    m.state.enable = false
    m.chart()
    m.state.readOnly = false
    m.detailsUI()
    m.state.readOnly = true
    m.detailsUI()
  })

  it('<ProbeConfig />', () => {
    const m = shallow(<ProbeConfig hook={() => {}} data={{}} />).instance()
    m.updateConfig({})
  })

  it('<Calibrate />', () => {
    const m = shallow(<Calibrate hook={() => {}} />).instance()
    m.setType('foo')()
    m.updateValue({ target: { value: '1.2' } })
    m.calibrate()
  })
})
