import Alert from './alert'
import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
const mockStore = configureMockStore([thunk])
Enzyme.configure({ adapter: new Adapter() })

describe('Notifications', () => {
  it('<Alert />', () => {
    jest.useFakeTimers()
    const logs = [
      {
        ts: 1538562759,
        emitter: 'UI',
        content: 'foo',
        display: true,
        type: 'ERROR'
      },
      {
        ts: 1538562751,
        emitter: 'UI',
        content: 'foo',
        display: true,
        type: 'INFO'
      },
      {
        ts: 1538562752,
        emitter: 'UI',
        content: 'foo',
        display: true,
        type: 'SUCCESS'
      },
      {
        ts: 1538562753,
        emitter: 'UI',
        content: 'foo',
        display: true,
        type: 'WARNING'
      },
      {
        ts: 1538562754,
        emitter: 'UI',
        content: 'foo',
        display: false,
        type: 'WARNING'
      }
    ]
    let store = mockStore({ logs: logs })
    const wrapper = shallow(<Alert store={store} />).dive()
    expect(wrapper.find('button').length).toBe(4)
    wrapper
      .find('button')
      .first()
      .simulate('click')
    jest.runAllTimers()
    expect(store.getActions().length).toBe(5)
  })
})
