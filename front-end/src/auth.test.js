import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Auth from './auth'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
global.fetch = jest.fn().mockImplementation(() => {
  let p = new Promise((resolve) => {
    resolve({
      ok: true,
      status: 200
    })
  })
  return p
})
describe('Auth', () => {
  it('<Auth />', () => {
    const m = shallow(<Auth store={mockStore()} />)
      .dive()
      .instance()
    m.handleUserChange({ target: { value: 'foo' } })
    m.handlePasswordChange({ target: { value: 'bar' } })
    m.handleUpdateCreds()
    m.handleUserChange({ target: { value: '' } })
    m.handlePasswordChange({ target: { value: '' } })
    m.handleUpdateCreds()
    m.props.updateCreds({})
  })
})
