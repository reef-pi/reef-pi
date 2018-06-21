import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Equipment from './equipment'
import Chart from './chart'
import Main from './main'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import {mockLocalStorage} from '../utils/test_helper'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Equipment ui', () => {
  const eqs = [{id: '1', outlet: '1', name: 'Foo'}]
  it('<Main />', () => {
    const outlets = [{id: '1', name: 'O1'}]
    const m = shallow(
      <Main store={mockStore({outlets: outlets, equipments: eqs})} />
    ).dive().instance()
    m.toggleAddEquipmentDiv()
    m.setOutlet(0)
    m.addEquipment()
    m.removeEquipment('1')()
  })

  it('<Equipment />', () => {
    shallow(<Equipment outlet={{}} hook={() => true} />).instance().update()
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({equipments: eqs})} />).dive()
  })
})
