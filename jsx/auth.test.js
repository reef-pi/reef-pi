import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Auth from './auth'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Auth', () => {
  it('<Auth />', () => {
    const m = shallow(<Auth store={mockStore()} />)
      .dive()
      .instance()
    m.handleUserChange({ target: { value: 'foo' } })
    m.handlePasswordChange({ target: { value: 'bar' } })
    m.updateCreds()
    m.handleUserChange({ target: { value: '' } })
    m.handlePasswordChange({ target: { value: '' } })
    m.updateCreds()
    m.props.updateCreds({})
  })
})
