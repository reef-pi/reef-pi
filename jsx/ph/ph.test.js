import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import Calibrate from './calibrate'
import Chart from './chart'
import Main from './main'
import New from './new'
import Notify from './notify'
import Probe from './probe'
import ProbeConfig from './probe_config'
import configureMockStore from 'redux-mock-store'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('pH ui', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })

  it('<New />', () => {
    shallow(<New />)
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({phprobes: [], ph_readings: {}})}/>)
  })

  it('<Notify />', () => {
    shallow(<Notify data={{}}/>)
  })

  it('<Probe />', () => {
    shallow(<Probe store={mockStore()}/>)
  })

  it('<ProbeConfig />', () => {
    shallow(<ProbeConfig data={{}}/>)
  })

  it('<Calibrate />', () => {
    shallow(<Calibrate />)
  })
})
