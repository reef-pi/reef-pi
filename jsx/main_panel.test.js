import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import MainPanel from './main_panel'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import {mockLocalStorage} from './utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('MainPanel', () => {
  it('<MainPanel />', () => {
    renderer.create(<MainPanel store={mockStore({capabilities: []})} />)
  })
})
