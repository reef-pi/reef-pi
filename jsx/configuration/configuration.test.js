import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Admin from './admin'
import Capabilities from './capabilities'
import Display from './display'
import HealthNotify from './health_notify'
import Main from './main'
import Settings from './settings'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import renderer from 'react-test-renderer'
import {Provider} from 'react-redux'
import fetchMock from 'fetch-mock'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Configuration ui', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('<Main />', () => {
    renderer.create(
      <Provider store={mockStore({capabilities: []})} >
        <Main />
      </Provider>
    )
  })

  it('<Admin />', () => {
    const m = shallow(<Admin store={mockStore()} />).dive().instance()
    fetchMock.postOnce('/api/admin/reload', {})
    fetchMock.postOnce('/api/admin/reboot', {})
    fetchMock.postOnce('/api/admin/poweroff', {})
    m.reload()
    m.powerOff()
    m.reboot()
  })

  it('<Display />', () => {
    const state = {
      display: {
        brightness: 50,
        on: true
      }
    }
    const m = shallow(<Display store={mockStore(state)} />).dive().instance()
    m.toggle()
    m.setBrightness({target: {value: 10}})
  })

  it('<Capabilities />', () => {
    const caps = {
      equipment: true,
      timer: false,
      dashboard: true
    }
    const m = shallow(<Capabilities capabilities={caps} update={() => true} />).instance()
    m.updateCapability('dashboard')({target: {checked: true}})
  })

  it('<Settings />', () => {
    const capabilities = {
      health_check: true
    }
    const settings = {
      name: 'foo',
      interface: 'en0',
      address: 'localhost:8080'
    }
    const m = shallow(
      <Settings store={mockStore({settings: settings, capabilities: capabilities})} />
    ).dive().instance()
    m.updateCapabilities(capabilities)
    m.updateCheckbox('foo')({target: {checked: true}})
    m.update()
    m.updateHealthNotify({})
  })

  it('<HealthNotify />', () => {
    const m = shallow(<HealthNotify state={{}} update={() => true} />).instance()
    m.updateEnable({target: {}})
    m.update('foo')({target: {}})
  })
})
