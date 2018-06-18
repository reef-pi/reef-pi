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

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore()

describe('Temperature controller ui', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()} />)
  })

  it('<New />', () => {
    shallow(<New />)
  })

  it('<Notify />', () => {
    shallow(<Notify config={{}} />)
  })

  it('<Sensor />', () => {
    shallow(<Sensor data={{}} />)
  })

  it('<SelectSensor />', () => {
    shallow(<SelectSensor />)
  })

  it('<ReadingsChart />', () => {
    shallow(<ReadingsChart store={mockStore({tcs: [], tc_usage: {}})} />)
  })

  it('<ControlChart />', () => {
    shallow(<ControlChart store={mockStore({tcs: [], tc_usage: {}})} />)
  })
})
