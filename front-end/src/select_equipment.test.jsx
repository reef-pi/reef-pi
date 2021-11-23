
import React from 'react'
import Enzyme, { mount, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import App from './app'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import JackSelector from './jack_selector'
import SelectEquipment from './select_equipment'
import SignIn from './sign_in'
import fetchMock from 'fetch-mock'
import {Provider} from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Equipment select', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  it('<SelectEquipment />', () => {
    const eqs = [{ id: '1', name: 'foo' }]
    const m = shallow(
      <Provider store={mockStore({ equipment: eqs })} active='1' update={() => {}} >
        <SelectEquipment/>
      </Provider>)
  })
})
