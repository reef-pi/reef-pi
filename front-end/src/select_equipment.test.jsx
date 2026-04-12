import React from 'react'
import { shallow } from 'enzyme'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import SelectEquipment from './select_equipment'
import fetchMock from 'fetch-mock'
import { Provider } from 'react-redux'

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
