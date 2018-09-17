import Sign_In from './sign_in'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
const mockStore = configureMockStore([thunk])
Enzyme.configure({ adapter: new Adapter() })

describe('Sign_In', () => {
  it('<Sign_In />', () => {
    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise((resolve, reject) => {
        resolve({
          ok: true,
          status: 200
        })
      })
      return p
    })
    const m = shallow(<Sign_In store={mockStore()} />).instance()
    m.handleUserChange({ target: { value: 'foo' } })
    m.handlePasswordChange({ target: { value: 'bar' } })
    m.login({
      preventDefault: function() {
        return true
      }
    })
    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise((resolve, reject) => {
        resolve({
          ok: true,
          status: 500
        })
      })
      return p
    })
    m.login({
      preventDefault: function() {
        return true
      }
    })
    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise((resolve, reject) => {
        resolve({
          ok: true,
          status: 401
        })
      })
      return p
    })
    m.login({
      preventDefault: function() {
        return true
      }
    })
  })
  it('Sign_In statics', () => {
    Sign_In.logout()
    Sign_In.getCreds()
    Sign_In.isSignIned()
  })
})
