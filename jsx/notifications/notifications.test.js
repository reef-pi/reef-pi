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
    const alerts = [
      {
        ts: 1538562759,
        content: 'foo',
        type: 'ERROR'
      },
      {
        ts: 1538562751,
        content: 'foo',
        type: 'INFO'
      },
      {
        ts: 1538562752,
        content: 'foo',
        type: 'SUCCESS'
      },
      {
        ts: 1538562753,
        content: 'foo',
        type: 'WARNING'
      }
    ]
    let store = mockStore({ alerts: alerts })
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
