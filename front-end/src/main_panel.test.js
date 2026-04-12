import React from 'react'
import { shallow } from 'enzyme'
import MainPanel from './main_panel'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'

const mockStore = configureMockStore([thunk])

describe('MainPanel', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  it('<MainPanel />', () => {
    const state = {
      info: {},
      errors: [],
      capabilities: {
        dashboard: true,
        equipment: true,
        timers: false
      }
    }
    const m = shallow(<MainPanel store={mockStore(state)} />).dive().instance()
    shallow(<MainPanel store={mockStore({
      info: {},
      errors: [],
      capabilities: {
        dashboard: false,
        equipment: true,
        timers: false
      }
    })}
    />).dive().instance()
  })
})
