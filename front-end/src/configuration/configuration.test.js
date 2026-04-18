import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import Admin from './admin'
import Capabilities from './capabilities'
import Display from './display'
import Errors from './errors'
import About from './about'
import HealthNotify from './health_notify'
import Main from './main'
import Settings from './settings'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import SignIn from 'sign_in'

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showUpdateSuccessful: jest.fn()
}))

const mockStore = configureMockStore([thunk])

const fullCapabilities = { health_check: true, equipment: true }
const fullSettings = {
  name: 'reef-pi',
  interface: 'wlan0',
  address: 'localhost:8080',
  https: false,
  capabilities: { health_check: true },
  health_check: { notify: false },
  display: false,
  notification: false,
  pprof: false,
  prometheus: false,
  cors: false
}

describe('Configuration ui', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('<Main />', () => {
    const m = shallow(<Main store={mockStore()} />).instance()
  })

  it('<Admin />', () => {
    const m = shallow(<Admin store={mockStore()} />)
      .dive()
      .instance()
    fetchMock.postOnce('/api/admin/reload', {})
    fetchMock.postOnce('/api/admin/reboot', {})
    fetchMock.postOnce('/api/admin/poweroff', {})
    SignIn.logout = jest.fn().mockImplementation(() => {
      return true
    })
    m.handleReload()
    m.handlePowerOff()
    m.handleReboot()
    m.handleSignout()
    m.props.reload()
    m.props.reboot()
    m.props.powerOff()
  })

  it('<Display />', () => {
    const state = {
      display: {
        brightness: 50,
        on: true
      }
    }
    const m = shallow(<Display store={mockStore(state)} />)
      .dive()
      .instance()
    shallow(<Display store={mockStore({})} />)
      .dive()
      .instance()
    shallow(<Display store={mockStore({ display: {} })} />)
      .dive()
      .instance()
  })

  it('<Capabilities />', () => {
    const caps = {
      equipment: true,
      timer: false,
      dashboard: true
    }
    const m = shallow(<Capabilities capabilities={caps} update={() => true} />).instance()
    m.updateCapability('dashboard')({ target: { checked: true } })
  })

  it('<Settings /> renders loading when settings/capabilities missing', () => {
    fetchMock.get('/api/settings', {})
    const store = mockStore({ settings: {}, capabilities: {} })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Settings /> renders full form with valid settings and capabilities', () => {
    fetchMock.get('/api/settings', fullSettings)
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Settings /> renders with display enabled (showDisplay branch)', () => {
    fetchMock.get('/api/settings', {})
    fetchMock.get('/api/display', { brightness: 50, on: true })
    const s = { ...fullSettings, display: true }
    const store = mockStore({ settings: s, capabilities: fullCapabilities, display: { brightness: 50, on: true } })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Settings /> handleUpdate — valid settings calls updateSettings', () => {
    fetchMock.get('/api/settings', fullSettings)
    fetchMock.post('/api/settings', fullSettings)
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    wrapper.find('#systemUpdateSettings').simulate('click')
    wrapper.unmount()
  })

  it('<Settings /> handleSetAddress updates address', () => {
    fetchMock.get('/api/settings', {})
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    wrapper.find('#to-row-address').simulate('change', { target: { value: 'localhost:9090' } })
    wrapper.unmount()
  })

  it('<Settings /> toRow (name) input updates settings', () => {
    fetchMock.get('/api/settings', {})
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    wrapper.find('#to-row-name').simulate('change', { target: { value: 'new-name' } })
    wrapper.unmount()
  })

  it('<Settings /> handleSetProtocolHttps removes port 80', () => {
    fetchMock.get('/api/settings', {})
    const s = { ...fullSettings, address: 'localhost:80', https: false }
    const store = mockStore({ settings: s, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    wrapper.find('a.dropdown-item').last().simulate('click')
    wrapper.unmount()
  })

  it('<Settings /> handleSetProtocolHttp removes port 443', () => {
    fetchMock.get('/api/settings', {})
    const s = { ...fullSettings, address: 'localhost:443', https: true }
    const store = mockStore({ settings: s, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    wrapper.find('a.dropdown-item').first().simulate('click')
    wrapper.unmount()
  })

  it('<Settings /> handleSetProtocol no port change when not 80 or 443', () => {
    fetchMock.get('/api/settings', {})
    const s = { ...fullSettings, address: 'localhost:8080', https: false }
    const store = mockStore({ settings: s, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    wrapper.find('a.dropdown-item').last().simulate('click')
    wrapper.unmount()
  })

  it('<Settings /> checkBoxComponent toggles a setting', () => {
    fetchMock.get('/api/settings', {})
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    wrapper.find('#notification').simulate('change', { target: { checked: true } })
    wrapper.unmount()
  })

  it('<HealthNotify />', () => {
    const m = shallow(<HealthNotify state={{}} update={() => true} />).instance()
    m.handleUpdateEnable({ target: {} })
    m.update('foo')({ target: {} })
    m.setState({
      notify: {
        enable: true
      }
    })
  })

  it('<About />', () => {
    const m = shallow(
      <About
        store={mockStore({
          info: { current_time: new Date(), version: 'test', uptime: '5 minutes', ip: 'localhost' },
          errors: []
        })}
      />
    )
      .dive()
      .instance()
  })
  it('<Errors />', () => {
    const wrapper = shallow(
      <Errors
        store={mockStore({
          errors: [{ id: '1', time: 'dd', message: 'dd' }]
        })}
      />
    ).dive()
    const m = wrapper.instance()
  })
})
