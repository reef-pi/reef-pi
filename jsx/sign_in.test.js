import Sign_In from './sign_in'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
const mockStore = configureMockStore([thunk])
Enzyme.configure({ adapter: new Adapter() })

describe('Sign_In', () => {
  beforeEach(() => {
    Sign_In.refreshPage = jest.fn().mockImplementation(() => {
      return true
    })
    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise((resolve, reject) => {
        resolve({
          ok: true,
          status: 200
        })
      })
      return p
    })
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('<Sign_In />', async () => {
    const m = shallow(<Sign_In store={mockStore()} />).instance()
    m.handleUserChange({ target: { value: 'foo' } })
    m.handlePasswordChange({ target: { value: 'bar' } })
    await m.login({
      preventDefault: function() {
        return true
      }
    })
    expect(Sign_In.refreshPage.mock.calls.length).toBe(1)
    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise((resolve, reject) => {
        resolve({
          ok: true,
          status: 500
        })
      })
      return p
    })
    await m.login({
      preventDefault: function() {
        return true
      }
    })
    expect(Sign_In.refreshPage.mock.calls.length).toBe(1)

    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise((resolve, reject) => {
        resolve({
          ok: true,
          status: 401
        })
      })
      return p
    })
    await m.login({
      preventDefault: function() {
        return true
      }
    })
    expect(Sign_In.refreshPage.mock.calls.length).toBe(1)
  })
  it('Sign_In statics', async () => {
    await Sign_In.logout()
    expect(Sign_In.refreshPage.mock.calls.length).toBe(1)
    Sign_In.getCreds()
    Sign_In.isSignedIn()
  })
})
