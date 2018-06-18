import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import App from './app'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import {mockLocalStorage} from './utils/test_helper'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('App', () => {
  it('<App />', () => {
    renderer.create(
      <Provider store={mockStore({info:{}, capabilities: []})}>
        <App />
      </Provider>)
  })
})
