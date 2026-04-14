import React from 'react'
import { shallow } from 'enzyme'
import HealthChart from './health_chart'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

describe('Health', () => {
  it('<HealthChart />', () => {
    const state = {
      health_stats: {},
      timer: window.setInterval(() => true, 10)
    }
    const m = shallow(<HealthChart store={mockStore(state)} />).dive().instance()
  })
  it('<HealthChart />', () => {
    const state = {
      trend: 'current'
    }
    const m = shallow(<HealthChart store={mockStore(state)} />).dive().instance()
  })
})
