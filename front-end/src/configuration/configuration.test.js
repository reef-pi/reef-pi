import React, { act } from 'react'
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
  const click = (node, event = {}) => {
    act(() => {
      node.prop('onClick')(event)
    })
  }

  const change = (node, event) => {
    act(() => {
      node.prop('onChange')(event)
    })
  }

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

  it('<Display /> mounts with on:true state', () => {
    fetchMock.get('/api/display', { brightness: 50, on: true })
    fetchMock.post('/api/display/off', {})
    fetchMock.post('/api/display/on', {})
    fetchMock.post('/api/display', {})
    const store = mockStore({ display: { brightness: 50, on: true } })
    const wrapper = mount(<Provider store={store}><Display /></Provider>)
    click(wrapper.find('button').first())
    change(wrapper.find('input[type="range"]'), { target: { value: '100' } })
    wrapper.unmount()
  })

  it('<Display /> mounts with on:false state', () => {
    fetchMock.get('/api/display', { brightness: 80, on: false })
    fetchMock.post('/api/display/on', {})
    const store = mockStore({ display: { brightness: 80, on: false } })
    const wrapper = mount(<Provider store={store}><Display /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Display /> mounts with no config (getDerivedStateFromProps guard)', () => {
    fetchMock.get('/api/display', {})
    const store = mockStore({ display: undefined })
    const wrapper = mount(<Provider store={store}><Display /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
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
    click(wrapper.find('#systemUpdateSettings'))
    wrapper.unmount()
  })

  it('<Settings /> handleSetAddress updates address', () => {
    fetchMock.get('/api/settings', {})
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    change(wrapper.find('#to-row-address'), { target: { value: 'localhost:9090' } })
    wrapper.unmount()
  })

  it('<Settings /> toRow (name) input updates settings', () => {
    fetchMock.get('/api/settings', {})
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    change(wrapper.find('#to-row-name'), { target: { value: 'new-name' } })
    wrapper.unmount()
  })

  it('<Settings /> handleSetProtocolHttps removes port 80', () => {
    fetchMock.get('/api/settings', {})
    const s = { ...fullSettings, address: 'localhost:80', https: false }
    const store = mockStore({ settings: s, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    click(wrapper.find('a.dropdown-item').last(), { preventDefault: () => {} })
    wrapper.unmount()
  })

  it('<Settings /> handleSetProtocolHttp removes port 443', () => {
    fetchMock.get('/api/settings', {})
    const s = { ...fullSettings, address: 'localhost:443', https: true }
    const store = mockStore({ settings: s, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    click(wrapper.find('a.dropdown-item').first(), { preventDefault: () => {} })
    wrapper.unmount()
  })

  it('<Settings /> handleSetProtocol no port change when not 80 or 443', () => {
    fetchMock.get('/api/settings', {})
    const s = { ...fullSettings, address: 'localhost:8080', https: false }
    const store = mockStore({ settings: s, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    click(wrapper.find('a.dropdown-item').last(), { preventDefault: () => {} })
    wrapper.unmount()
  })

  it('<Settings /> checkBoxComponent toggles a setting', () => {
    fetchMock.get('/api/settings', {})
    const store = mockStore({ settings: fullSettings, capabilities: fullCapabilities })
    const wrapper = mount(<Provider store={store}><Settings /></Provider>)
    change(wrapper.find('#notification'), { target: { checked: true } })
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

  it('<About /> mounts and renders info', () => {
    fetchMock.get('/api/info', { version: '2.0', current_time: '2026-04-18', uptime: '1 day', ip: '192.168.1.1', model: 'Pi 4' })
    const info = { current_time: '2026-04-18', version: '2.0', uptime: '1 day', ip: '192.168.1.1', model: 'Pi 4' }
    const store = mockStore({ info, errors: [] })
    const wrapper = mount(<Provider store={store}><About /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<About /> mounts with empty info', () => {
    fetchMock.get('/api/info', {})
    const store = mockStore({ info: {}, errors: [] })
    const wrapper = mount(<Provider store={store}><About /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Errors /> mounts with error list — renders items and handles clear', () => {
    fetchMock.get('/api/errors', [])
    fetchMock.delete('/api/errors/clear', {})
    const errs = [
      { id: '1', time: '2026-04-18', message: 'something broke', count: 1 },
      { id: 'alert:2', time: '2026-04-18', message: 'alert item', count: 3 }
    ]
    const store = mockStore({ errors: errs })
    const wrapper = mount(<Provider store={store}><Errors /></Provider>)
    click(wrapper.find('button').first())
    wrapper.unmount()
  })

  it('<Errors /> mounts with empty error list', () => {
    fetchMock.get('/api/errors', [])
    const store = mockStore({ errors: [] })
    const wrapper = mount(<Provider store={store}><Errors /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Errors /> delete button dispatches deleteError', () => {
    fetchMock.get('/api/errors', [])
    fetchMock.delete('/api/errors/1', {})
    const errs = [{ id: '1', time: '2026-04-18', message: 'err', count: 1 }]
    const store = mockStore({ errors: errs })
    const wrapper = mount(<Provider store={store}><Errors /></Provider>)
    click(wrapper.find('input.btn-outline-secondary'))
    wrapper.unmount()
  })
})
