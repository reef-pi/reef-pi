import Alert from './alert'
import AlertItem from './alert_item'
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
    const store = mockStore({ alerts: alerts })
    const wrapper = shallow(<Alert store={store} />).dive()
    expect(wrapper.find(AlertItem).length).toBe(4)
    const l = wrapper.instance()
    expect(l.state.containerFix).toEqual('')
    global.window.scrollY = 60
    l.handleScroll()
    expect(l.state.containerFix).toEqual('fix')
    global.window.scrollY = 0
    l.handleScroll()
    expect(l.state.containerFix).toEqual('')
  })
  it('<AlertItem />', () => {
    const close = jest.fn()
    const alert = {
      ts: 1538562753,
      content: 'foo',
      type: 'WARNING'
    }
    const wrapper = shallow(<AlertItem notification={alert} close={close} />)

    wrapper
      .find('button')
      .first()
      .simulate('click')
    jest.runAllTimers()
    expect(close.mock.calls.length).toBe(1)
    shallow(<AlertItem notification={alert} close={close} />)
    jest.runAllTimers()
    expect(close.mock.calls.length).toBe(2)
  })
})
