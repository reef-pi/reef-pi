import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Admin from './admin'
import Capabilities from './capabilities'
import ComponentSelector from './component_selector'
import Dashboard from './dashboard'
import Display from './display'
import Grid from './grid'
import HealthNotify from './health_notify'
import Main from './main'
import Settings from './settings'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import renderer from 'react-test-renderer'
import {Provider} from 'react-redux'
window.localStorage = mockLocalStorage()

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Configuration ui', () => {
  it('<Main />', () => {
    renderer.create(
      <Provider store={mockStore({capabilities: []})} >
        <Main />
      </Provider>
    )
  })

  it('<Admin />', () => {
    renderer.create(
      <Provider store={mockStore()} >
        <Admin />
      </Provider>
    )
  })

  it('<Display />', () => {
    renderer.create(
      <Provider store={mockStore({capabilities: []})} >
        <Display />
      </Provider>
    )
  })

  it('<Capabilities />', () => {
    shallow(<Capabilities capabilities={[]} />)
  })

  it('<ComponentSelector />', () => {
    shallow(<ComponentSelector />)
  })

  it('<Dashboard />', () => {
    shallow(<Dashboard store={mockStore()} />)
  })

  it('<Grid />', () => {
    shallow(<Grid />)
  })

  it('<Settings />', () => {
    shallow(<Settings store={mockStore()} />)
  })

  it('<HealthNotify />', () => {
    shallow(<HealthNotify state={{}} />)
  })
})
