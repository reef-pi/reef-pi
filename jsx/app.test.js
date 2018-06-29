import React from 'react'
import Enzyme, {shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import App from './app'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import {mockLocalStorage} from './utils/test_helper'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import 'isomorphic-fetch'
import JackSelector from './jack_selector'
import SelectEquipment from './select_equipment'
import SignIn from './sign_in'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('App', () => {
  it('<App />', () => {
    const m = shallow(
      <App store={mockStore({info:{}, capabilities: []})} />
    ).dive().instance()
  })

  it('<JackSelector />', ()=> {
    const jacks = [{id: '1',name: 'Foo', pins: [1,2]}]
    const m = shallow(
      <JackSelector store={mockStore({jacks: jacks})} id='1' update={()=>{}}/>
    ).dive().instance()
    m.setJack(0)
  })

  it('<SelectEquipment />', ()=> {
    const eqs = [{id: '1', name: 'foo'}]
    const m = shallow(
      <SelectEquipment store={mockStore({equipments: eqs})} active='1' update={()=>{}}/>
    ).dive().instance()
    m.setEquipment(0)
  })

  it('<SignIn />', ()=> {
    SignIn.removeCreds()
    SignIn.set('a', 1)
    const m = shallow(<SignIn />).instance()
  })
})
