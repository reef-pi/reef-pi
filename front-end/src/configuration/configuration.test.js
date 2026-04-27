import React from 'react'
import Main, { configRoutes } from './main'
import Admin, { RawAdmin } from './admin'
import Capabilities from './capabilities'
import Display, { RawDisplay } from './display'
import Errors, { RawErrors } from './errors'
import About, { RawAbout } from './about'
import HealthNotify from './health_notify'
import { RawSettings } from './settings'
import { showError, showUpdateSuccessful } from 'utils/alert'
import { confirm } from 'utils/confirm'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import SignIn from 'sign_in'

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showUpdateSuccessful: jest.fn()
}))

jest.mock('utils/confirm', () => ({
  confirm: jest.fn(() => Promise.resolve(true))
}))

const fullCapabilities = { health_check: true, equipment: true }
const fullSettings = {
  name: 'reef-pi',
  interface: 'wlan0',
  address: 'localhost:8080',
  https: false,
  capabilities: { health_check: true },
  health_check: { enable: false, max_memory: 100, max_cpu: 75, notify: false },
  display: false,
  notification: false,
  pprof: false,
  prometheus: false,
  cors: false,
  rpi_pwm_freq: 1200
}

const flattenElements = (node) => {
  const elements = []
  const visit = child => {
    if (!child) {
      return
    }
    if (Array.isArray(child)) {
      child.forEach(visit)
      return
    }
    elements.push(child)
    if (child.props && child.props.children) {
      visit(child.props.children)
    }
  }
  visit(node)
  return elements
}

const findByType = (node, type) => flattenElements(node).filter(element => element.type === type)

const findByProps = (node, props) => {
  return flattenElements(node).find(element => {
    return Object.entries(props).every(([key, value]) => element.props && element.props[key] === value)
  })
}

describe('Configuration ui', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('<Main />', () => {
    const main = new Main({})
    const rendered = main.render()
    expect(Main).toBeDefined()
    expect(findByType(rendered, 'li')).toHaveLength(configRoutes.length)
  })

  it('<Admin />', async () => {
    const m = new RawAdmin({
      reload: jest.fn(),
      reboot: jest.fn(),
      powerOff: jest.fn(),
      dbImport: jest.fn(),
      upgrade: jest.fn()
    })
    SignIn.logout = jest.fn()
    m.setState = update => { m.state = { ...m.state, ...update } }
    m.handleVersionChange({ target: { value: '4.0.0' } })
    m.handleInstall()
    m.handleReload()
    m.handlePowerOff()
    m.handleReboot()
    m.handleSignout()
    await Promise.resolve()
    expect(confirm).toHaveBeenCalled()
    expect(m.props.upgrade).toHaveBeenCalledWith('4.0.0')
    expect(m.props.reload).toHaveBeenCalled()
    expect(m.props.powerOff).toHaveBeenCalled()
    expect(m.props.reboot).toHaveBeenCalled()
    expect(SignIn.logout).toHaveBeenCalled()
  })

  it('<Display /> mounts with on:true state', () => {
    const display = new RawDisplay({
      config: { brightness: 50, on: true },
      fetchDisplay: jest.fn(),
      switchDisplay: jest.fn(),
      setBrightness: jest.fn()
    })
    display.setState = update => { display.state = { ...display.state, ...update } }
    display.handleToggle()
    display.handleSetBrightness({ target: { value: '100' } })
    expect(display.props.switchDisplay).toHaveBeenCalledWith(true)
    expect(display.props.setBrightness).toHaveBeenCalledWith(100)
    expect(Display).toBeDefined()
  })

  it('<Display /> mounts with on:false state', () => {
    const display = new RawDisplay({
      config: { brightness: 80, on: false },
      fetchDisplay: jest.fn(),
      switchDisplay: jest.fn(),
      setBrightness: jest.fn()
    })
    const rendered = display.render()
    const button = findByType(rendered, 'button')[0]
    expect(button.props.className).toContain('btn-outline-success')
  })

  it('<Display /> mounts with no config (getDerivedStateFromProps guard)', () => {
    expect(RawDisplay.getDerivedStateFromProps({ config: undefined }, { on: false })).toBeNull()
    expect(RawDisplay.getDerivedStateFromProps({ config: {} }, { on: false })).toBeNull()
  })

  it('<Capabilities />', () => {
    const caps = {
      equipment: true,
      timer: false,
      dashboard: true
    }
    const update = jest.fn()
    const m = new Capabilities({ capabilities: caps, update })
    m.setState = updateState => { m.state = { ...m.state, ...updateState } }
    m.updateCapability('dashboard')({ target: { checked: true } })
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ dashboard: true }))
  })

  it('<Settings /> renders loading when settings/capabilities missing', () => {
    const settings = new RawSettings({
      settings: {},
      capabilities: {},
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    const rendered = settings.render()
    expect(flattenElements(rendered).some(element => element.props && element.props.children === 'loading')).toBe(true)
  })

  it('<Settings /> renders full form with valid settings and capabilities', () => {
    const settings = new RawSettings({
      settings: fullSettings,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    const rendered = settings.render()
    expect(findByProps(rendered, { id: 'systemUpdateSettings' })).toBeDefined()
  })

  it('<Settings /> renders with display enabled (showDisplay branch)', () => {
    const s = { ...fullSettings, display: true }
    const settings = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    const rendered = settings.render()
    expect(flattenElements(rendered).some(element => element.type === Display)).toBe(true)
  })

  it('<Settings /> handleUpdate valid settings calls updateSettings', () => {
    const updateSettings = jest.fn()
    const settings = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings
    })
    settings.setState = update => { settings.state = { ...settings.state, ...update } }
    settings.handleUpdate()
    expect(updateSettings).toHaveBeenCalled()
    expect(showUpdateSuccessful).toHaveBeenCalled()
  })

  it('<Settings /> handleSetAddress updates address', () => {
    const settings = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    settings.setState = update => { settings.state = { ...settings.state, ...update } }
    settings.handleSetAddress({ target: { value: 'localhost:9090' } })
    expect(settings.state.settings.address).toBe('localhost:9090')
  })

  it('<Settings /> toRow (name) input updates settings', () => {
    const settings = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    settings.setState = update => { settings.state = { ...settings.state, ...update } }
    const row = settings.toRow('name')
    const input = findByProps(row, { id: 'to-row-name' })
    input.props.onChange({ target: { value: 'new-name' } })
    expect(settings.state.settings.name).toBe('new-name')
  })

  it('<Settings /> handleSetProtocolHttps removes port 80', () => {
    const s = { ...fullSettings, address: 'localhost:80', https: false }
    const settings = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    settings.setState = update => { settings.state = { ...settings.state, ...update } }
    settings.handleSetProtocolHttps()
    expect(settings.state.settings.address).toBe('localhost')
    expect(settings.state.settings.https).toBe(true)
  })

  it('<Settings /> handleSetProtocolHttp removes port 443', () => {
    const s = { ...fullSettings, address: 'localhost:443', https: true }
    const settings = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    settings.setState = update => { settings.state = { ...settings.state, ...update } }
    settings.handleSetProtocolHttp()
    expect(settings.state.settings.address).toBe('localhost')
    expect(settings.state.settings.https).toBe(false)
  })

  it('<Settings /> handleSetProtocol no port change when not 80 or 443', () => {
    const s = { ...fullSettings, address: 'localhost:8080', https: false }
    const settings = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    settings.setState = update => { settings.state = { ...settings.state, ...update } }
    settings.handleSetProtocolHttps()
    expect(settings.state.settings.address).toBe('localhost:8080')
    expect(settings.state.settings.https).toBe(true)
  })

  it('<Settings /> checkBoxComponent toggles a setting', () => {
    const settings = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    settings.setState = update => { settings.state = { ...settings.state, ...update } }
    const checkboxRow = settings.checkBoxComponent('notification')
    const checkbox = findByProps(checkboxRow, { id: 'notification' })
    checkbox.props.onChange({ target: { checked: true } })
    expect(settings.state.settings.notification).toBe(true)
  })

  it('<HealthNotify />', () => {
    const update = jest.fn()
    const m = new HealthNotify({
      state: { enable: false, report_enable: false, report_schedule: '' },
      update
    })
    m.setState = updateState => { m.state = { ...m.state, ...updateState } }
    m.handleUpdateEnable({ target: { checked: true } })
    m.update('max_cpu')({ target: { value: '42' } })
    expect(update).toHaveBeenCalled()
    expect(m.state.notify.enable).toBe(true)
    expect(m.state.notify.max_cpu).toBe(42)
  })

  it('<About /> mounts and renders info', () => {
    const about = new RawAbout({
      info: { current_time: '2026-04-18', version: '2.0', uptime: '1 day', ip: '192.168.1.1', model: 'Pi 4' },
      fetchInfo: jest.fn()
    })
    const rendered = about.render()
    expect(flattenElements(rendered).some(element => element.props && element.props.href === 'https://github.com/reef-pi/reef-pi')).toBe(true)
    about.componentWillUnmount()
  })

  it('<About /> mounts with empty info', () => {
    const about = new RawAbout({
      info: {},
      fetchInfo: jest.fn()
    })
    expect(about.render().type).toBe('div')
    about.componentWillUnmount()
  })

  it('<Errors /> mounts with error list and handles clear', () => {
    const clear = jest.fn()
    const errors = new RawErrors({
      errors: [
        { id: '1', time: '2026-04-18', message: 'something broke', count: 1 },
        { id: 'alert:2', time: '2026-04-18', message: 'alert item', count: 3 }
      ],
      clear,
      delete: jest.fn(),
      fetch: jest.fn()
    })
    const rendered = errors.render()
    const button = findByType(rendered, 'button')[0]
    button.props.onClick()
    expect(clear).toHaveBeenCalled()
  })

  it('<Errors /> mounts with empty error list', () => {
    const errors = new RawErrors({
      errors: [],
      clear: jest.fn(),
      delete: jest.fn(),
      fetch: jest.fn()
    })
    expect(errors.render().type).toBe('div')
  })

  it('<Errors /> delete button dispatches deleteError', () => {
    const del = jest.fn()
    const errors = new RawErrors({
      errors: [{ id: '1', time: '2026-04-18', message: 'err', count: 1 }],
      clear: jest.fn(),
      delete: del,
      fetch: jest.fn()
    })
    const rendered = errors.render()
    const input = findByProps(rendered, { className: 'btn btn-sm btn-outline-secondary' })
    input.props.onClick()
    expect(del).toHaveBeenCalledWith('1')
  })
})
