import React from 'react'
import Enzyme, {shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import MainPanel from './main_panel'
import configureMockStore from 'redux-mock-store'
import {mockLocalStorage} from './utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('MainPanel', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  it('<MainPanel />', () => {
    const state = {
      capabilities: {
        dashboard: true,
        equipments: true,
        timers: false
      }
    }
    const m = shallow(<MainPanel store={mockStore(state)} />).dive().instance()
  })
})
