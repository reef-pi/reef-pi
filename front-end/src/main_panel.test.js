import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import MainPanel from './main_panel'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'

Enzyme.configure({ adapter: new Adapter() })
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
    m.setTab('ato')()
    m.props.fetchInfo()
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
