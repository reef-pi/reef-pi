import SignIn from './sign_in'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
const mockStore = configureMockStore([thunk])
Enzyme.configure({ adapter: new Adapter() })

describe('SignIn', () => {
  beforeEach(() => {
    SignIn.refreshPage = jest.fn().mockImplementation(() => {
      return true
    })
    global.fetch = jest.fn().mockImplementation(() => {
      const p = new Promise((resolve) => {
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
  it('<SignIn />', async () => {
    const m = shallow(<SignIn store={mockStore()} />).instance()
    m.handleUserChange({ target: { value: 'foo' } })
    m.handlePasswordChange({ target: { value: 'bar' } })
    await m.handleLogin({
      preventDefault: function () {
        return true
      }
    })
    expect(SignIn.refreshPage.mock.calls.length).toBe(1)
    global.fetch = jest.fn().mockImplementation(() => {
      const p = new Promise((resolve, reject) => {
        resolve({
          ok: false,
          status: 500
        })
      })
      return p
    })
    await m.handleLogin({
      preventDefault: function () {
        return true
      }
    })
    expect(SignIn.refreshPage.mock.calls.length).toBe(1)

    global.fetch = jest.fn().mockImplementation(() => {
      const p = new Promise((resolve, reject) => {
        resolve({
          ok: false,
          status: 401
        })
      })
      return p
    })
    await m.handleLogin({
      preventDefault: function () {
        return true
      }
    })
    expect(SignIn.refreshPage.mock.calls.length).toBe(1)
  })
  it('SignIn statics', async () => {
    await SignIn.logout()
    expect(SignIn.refreshPage.mock.calls.length).toBe(1)
    SignIn.isSignedIn()
  })
})
