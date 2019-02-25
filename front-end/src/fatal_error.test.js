import FatalError from './fatal_error'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
// import configureMockStore from 'redux-mock-store'
// import thunk from 'redux-thunk'
// const mockStore = configureMockStore([thunk])
Enzyme.configure({ adapter: new Adapter() })

describe('Sign_In', () => {
  beforeEach(() => {})
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('<FatalError />', async () => {
    jest.useFakeTimers()
    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise(resolve => {
        resolve({
          ok: true,
          status: 200
        })
      })
      return p
    })
    const m = shallow(<FatalError />).instance()
    expect(m.state.up).toBe(true)
    jest.advanceTimersByTime(5000)
    expect(m.state.up).toBe(true)
    global.fetch = jest.fn().mockImplementation(() => {
      var p = new Promise((resolve, reject) => {
        reject(Error)
      })
      return p
    })
    jest.advanceTimersByTime(5000)
    m.componentWillUnmount()
  })
})
