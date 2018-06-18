import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Auth from './auth'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import {mockLocalStorage} from './utils/test_helper'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore()
window.localStorage = mockLocalStorage()

describe('Auth', () => {
  it('<Auth />', () => {
    renderer.create(<Auth store={mockStore()} />)
  })
})
