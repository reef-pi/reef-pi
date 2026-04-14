import React from 'react'
import 'isomorphic-fetch'
import { shallow } from 'enzyme'
import New from './new'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

describe('New ATO', () => {
  it('<New />', () => {
    renderer.create(<New store={mockStore()} />)
    const wrapper = shallow(<New store={mockStore()} />)
    const component = wrapper.dive().instance()
    component.handleToggle()
    component.handleSubmit({
      name: 'test',
      inlet: '3',
      period: 60
    })
  })
})
