import React from 'react'
import Enzyme,{shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import HealthChart from './health_chart'
import configureMockStore from 'redux-mock-store'
import {mockLocalStorage} from './utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Health', () => {
  const state = {
    health_stats: {}
  }

  it('<HealthChart />', () => {
    const m = shallow(<HealthChart store={mockStore(state)} />).dive()
  })
})
