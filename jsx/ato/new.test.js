import React from 'react'
import 'isomorphic-fetch'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import New from './new'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import thunk from 'redux-thunk'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('New ATO', () => {
  it('<New />', () => {
    renderer.create(<New store={mockStore()} />)
    const wrapper = shallow(<New store={mockStore()} />)
    const component = wrapper.dive().instance()
    component.toggle()
    component.add()
    component.setInlet('1')
  })
})
