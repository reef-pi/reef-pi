import React from 'react'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import NotificationAlert from './alert'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const alerts = [
  { ts: 1, level: 'info', message: 'Test info' },
  { ts: 2, level: 'error', message: 'Test error' }
]

describe('NotificationAlert', () => {
  it('renders without throwing with alerts', () => {
    const store = mockStore({ alerts })
    expect(() =>
      shallow(<Provider store={store}><NotificationAlert /></Provider>)
    ).not.toThrow()
  })

  it('renders without throwing with no alerts', () => {
    const store = mockStore({ alerts: [] })
    expect(() =>
      shallow(<Provider store={store}><NotificationAlert /></Provider>)
    ).not.toThrow()
  })

  it('renders via dive with alerts', () => {
    const store = mockStore({ alerts })
    const wrapper = shallow(<NotificationAlert store={store} />).dive()
    expect(wrapper).toBeDefined()
  })

  it('renders via dive with empty alerts', () => {
    const store = mockStore({ alerts: [] })
    const wrapper = shallow(<NotificationAlert store={store} />).dive()
    expect(wrapper).toBeDefined()
  })
})
