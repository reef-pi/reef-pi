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
    shallow(<InletSelector store={mockStore()} />).dive()
  })

  it('<Inlets />', () => {
    shallow(<Inlets store={mockStore()} />)
  })

  it('<Jacks />', () => {
    shallow(<Jacks store={mockStore()} />)
  })

  it('<Outlets />', () => {
    shallow(<Outlets store={mockStore()} />)
  })
})
