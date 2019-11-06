import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import HealthChart from './health_chart'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Health', () => {
  it('<HealthChart />', () => {
    const state = {
      health_stats: {},
      timer: window.setInterval(() => true, 10)
    }
    const m = shallow(<HealthChart store={mockStore(state)} />).dive().instance()
    m.componentWillUnmount()
  })
  it('<HealthChart />', () => {
    const state = {
      trend: 'current'
    }
    const m = shallow(<HealthChart store={mockStore(state)} />).dive().instance()
    m.componentWillUnmount()
  })
})
