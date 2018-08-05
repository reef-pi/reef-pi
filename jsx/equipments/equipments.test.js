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
  const eqs = [{id: '1', outlet: '1', name: 'Foo', on: true}]
  const outlets = [{id: '1', name: 'O1'}]
  it('<Main />', () => {
    const m = shallow(
      <Main store={mockStore({outlets: outlets, equipments: eqs})} />
    ).dive().instance()
    m.toggleAddEquipmentDiv()
    m.setOutlet(0)()
    m.addEquipment()
    m.remove('1')()
  })

  it('<Equipment />', () => {
    const eq = shallow(
      <Equipment
        outlet={{}}
        on
        name='foo'
        equipment_id='1'
        update={() => true}
        remove={() => true}
        outlets={outlets}
      />).instance()
    eq.setOutlet({name: 'foo', id: '1', pin: 1})()
    eq.edit()
    eq.control()
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({equipments: eqs})} />).dive()
  })
})
