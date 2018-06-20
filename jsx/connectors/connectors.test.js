import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Inlets from './inlets'
import InletSelector from './inlet_selector'
import Jacks from './jacks'
import Outlets from './outlets'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import {mockLocalStorage} from '../utils/test_helper'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Connectors', () => {
  it('<Main />', () => {
    shallow(<Main />)
  })

  it('<InletSelector />', () => {
    const state = {
      inlets: [{id: '1', name: 'foo', pin: [1]}]
    }
    const m = shallow(<InletSelector store={mockStore(state)} active='1' update={() => true} />).dive().instance()
    m.set(0)
  })

  it('<Inlets />', () => {
    const state = {
      inlets: [{id: '1', name: 'foo', pin: [1]}]
    }
    const m = shallow(<Inlets store={mockStore(state)} />).dive().instance()
    m.add()
    m.remove('1')()
  })

  it('<Jacks />', () => {
    const state = {
      jacks: [{id: '1', name: 'J2', pins: [0, 2]}]
    }
    const m = shallow(<Jacks store={mockStore(state)} />).dive().instance()
    m.add()
    m.setDriver('rpi')
    m.remove('1')()
  })

  it('<Outlets />', () => {
    const state = {
      outlets: [{id: '1', name: 'J2', pins: [0, 2]}]
    }
    const m = shallow(<Outlets store={mockStore(state)} />).dive().instance()
    m.add()
    m.remove('1')()
  })
})
