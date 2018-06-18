import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import HealthChart from './health_chart'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import {mockLocalStorage} from './utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Health', () => {
  it('<HealthChart />', () => {
    renderer.create(<HealthChart store={mockStore()} />)
  })
})
