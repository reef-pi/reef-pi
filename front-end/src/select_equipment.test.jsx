import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import SelectEquipment from './select_equipment'
import fetchMock from 'fetch-mock'
import { Provider } from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Equipment select', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  it('<SelectEquipment />', () => {
    const eqs = [{ id: '1', name: 'foo' }]
    shallow(
      <Provider store={mockStore({ equipment: eqs })} active='1' update={() => {}}>
        <SelectEquipment />
      </Provider>)
  })
})
