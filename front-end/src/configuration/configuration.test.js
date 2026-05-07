import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { RawAdmin } from './admin'
import Capabilities from './capabilities'
import { RawDisplay } from './display'
import { RawErrors } from './errors'
import { RawAbout } from './about'
import HealthNotify from './health_notify'
import Main, { configRoutes } from './main'
import { RawSettings } from './settings'
import SignIn from 'sign_in'
import 'isomorphic-fetch'
import * as Alert from 'utils/alert'
import i18n from 'utils/i18n'

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showUpdateSuccessful: jest.fn()
}))

jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => Promise.resolve(true))
      .bind(this)
  }
})

const fullCapabilities = { health_check: true, equipment: true }
const fullSettings = {
  name: 'reef-pi',
  interface: 'wlan0',
  address: 'localhost:8080',
  https: false,
  capabilities: { health_check: true },
  health_check: { enable: false, max_memory: 100, max_cpu: 80, max_cpu_temp: 70, report_enable: false, report_schedule: '' },
  display: false,
  notification: false,
  pprof: false,
  prometheus: false,
  cors: false,
  rpi_pwm_freq: 1000
}

const patchSetState = component => {
  component.setState = update => {
    component.state = {
      ...component.state,
      ...(typeof update === 'function' ? update(component.state) : update)
    }
  }
}

describe('Configuration ui', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main />', () => {
    const component = new Main({})
    const tree = component.render()
    const panels = tree.props.children[0].props.children.props.children
    expect(panels).toHaveLength(configRoutes.length)
    expect(panels[0].props.children.props.id).toBe('config-nomatch')
    expect(panels[6].props.children.props.id).toBe('config-admin')
  })

  it('<Admin />', () => {
    const reload = jest.fn()
    const reboot = jest.fn()
    const powerOff = jest.fn()
    const dbImport = jest.fn().mockReturnValue(jest.fn())
    const upgrade = jest.fn()
    const m = new RawAdmin({ reload, reboot, powerOff, dbImport, upgrade })
    patchSetState(m)
    SignIn.logout = jest.fn().mockImplementation(() => true)

    m.handleReload()
    m.handlePowerOff()
    m.handleReboot()
    m.handleSignout()
    m.handleVersionChange({ target: { value: '4.0.0' } })
    m.handleInstall()
    expect(SignIn.logout).toHaveBeenCalled()

    return Promise.resolve().then(() => {
      expect(reload).toHaveBeenCalled()
      expect(reboot).toHaveBeenCalled()
      expect(powerOff).toHaveBeenCalled()
      expect(upgrade).toHaveBeenCalledWith('4.0.0')
      expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
    })
  })

  it('<Display /> mounts with on:true state', () => {
    const props = {
      config: { brightness: 50, on: true },
      fetchDisplay: jest.fn(),
      switchDisplay: jest.fn(),
      setBrightness: jest.fn()
    }
    const component = new RawDisplay(props)
    patchSetState(component)
    component.componentDidMount()
    component.handleToggle()
    component.handleSetBrightness({ target: { value: '100' } })
    expect(props.fetchDisplay).toHaveBeenCalled()
    expect(props.switchDisplay).toHaveBeenCalled()
    expect(props.setBrightness).toHaveBeenCalledWith(100)
  })

  it('<Display /> mounts with on:false state', () => {
    const component = new RawDisplay({
      config: { brightness: 80, on: false },
      fetchDisplay: jest.fn(),
      switchDisplay: jest.fn(),
      setBrightness: jest.fn()
    })
    expect(component.render().props.className).toBe('container')
  })

  it('<Display /> mounts with no config (getDerivedStateFromProps guard)', () => {
    expect(RawDisplay.getDerivedStateFromProps({ config: undefined }, {})).toBeNull()
  })

  it('<Display /> derives config state without mutating previous state', () => {
    const previousState = { brightness: 25, on: false, local: true }
    const derived = RawDisplay.getDerivedStateFromProps({
      config: { brightness: 80, on: true }
    }, previousState)

    expect(previousState).toEqual({ brightness: 25, on: false, local: true })
    expect(derived).toEqual({ brightness: 80, on: true, local: true })
    expect(derived).not.toBe(previousState)
  })

  it('<Capabilities />', () => {
    const update = jest.fn()
    const m = new Capabilities({
      capabilities: {
        equipment: true,
        timer: false,
        dashboard: true
      },
      update
    })
    patchSetState(m)
    m.updateCapability('dashboard')({ target: { checked: true } })
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ dashboard: true }))
  })

  it('<Settings /> renders loading when settings/capabilities missing', () => {
    const component = new RawSettings({
      settings: {},
      capabilities: {},
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    expect(renderToStaticMarkup(component.render())).toContain('loading')
  })

  it('<Settings /> renders full form with valid settings and capabilities', () => {
    const component = new RawSettings({
      settings: fullSettings,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    expect(renderToStaticMarkup(component.render())).toContain('systemUpdateSettings')
  })

  it('<Settings /> renders with display enabled (showDisplay branch)', () => {
    const s = { ...fullSettings, display: true }
    const component = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    const display = component.showDisplay()
    expect(display.type).toBe('div')
  })

  it('<Settings /> handleUpdate valid settings calls updateSettings', () => {
    const updateSettings = jest.fn()
    const component = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings
    })
    patchSetState(component)
    component.handleUpdate()
    expect(updateSettings).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('<Settings /> handleSetAddress updates address', () => {
    const component = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    patchSetState(component)
    component.handleSetAddress({ target: { value: 'localhost:9090' } })
    expect(component.state.settings.address).toBe('localhost:9090')
  })

  it('<Settings /> toRow (name) input updates settings', () => {
    const component = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    patchSetState(component)
    const row = component.toRow('name')
    row.props.children[1].props.onChange({ target: { value: 'new-name' } })
    expect(component.state.settings.name).toBe('new-name')
  })

  it('<Settings /> handleSetProtocolHttps removes port 80', () => {
    const s = { ...fullSettings, address: 'localhost:80', https: false }
    const component = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    patchSetState(component)
    component.handleSetProtocolHttps()
    expect(component.state.settings.address).toBe('localhost')
    expect(component.state.settings.https).toBe(true)
  })

  it('<Settings /> handleSetProtocolHttp removes port 443', () => {
    const s = { ...fullSettings, address: 'localhost:443', https: true }
    const component = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    patchSetState(component)
    component.handleSetProtocolHttp()
    expect(component.state.settings.address).toBe('localhost')
    expect(component.state.settings.https).toBe(false)
  })

  it('<Settings /> handleSetProtocol no port change when not 80 or 443', () => {
    const s = { ...fullSettings, address: 'localhost:8080', https: false }
    const component = new RawSettings({
      settings: s,
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    patchSetState(component)
    component.handleSetProtocolHttps()
    expect(component.state.settings.address).toBe('localhost:8080')
    expect(component.state.settings.https).toBe(true)
  })

  it('<Settings /> checkBoxComponent toggles a setting', () => {
    const component = new RawSettings({
      settings: { ...fullSettings },
      capabilities: fullCapabilities,
      fetchSettings: jest.fn(),
      updateSettings: jest.fn()
    })
    patchSetState(component)
    const checkbox = component.checkBoxComponent('notification')
    checkbox.props.children.props.children[0].props.onChange({ target: { checked: true } })
    expect(component.state.settings.notification).toBe(true)
  })

  it('<HealthNotify />', () => {
    const update = jest.fn()
    const m = new HealthNotify({
      state: {
        enable: false,
        max_memory: 10,
        max_cpu: 20,
        max_cpu_temp: 30,
        report_enable: false,
        report_schedule: ''
      },
      update
    })
    patchSetState(m)
    const previousNotify = m.state.notify
    m.handleUpdateEnable({ target: { checked: true } })
    expect(previousNotify).toEqual({
      enable: false,
      max_memory: 10,
      max_cpu: 20,
      max_cpu_temp: 30,
      report_enable: false,
      report_schedule: ''
    })
    expect(m.state.notify).not.toBe(previousNotify)
    const previousEnableNotify = m.state.notify
    m.update('max_cpu')({ target: { value: '11' } })
    expect(previousEnableNotify).toEqual({
      enable: true,
      max_memory: 10,
      max_cpu: 20,
      max_cpu_temp: 30,
      report_enable: false,
      report_schedule: ''
    })
    expect(m.state.notify).not.toBe(previousEnableNotify)
    const previousCpuNotify = m.state.notify
    m.handleUpdateReportEnable({ target: { checked: true } })
    expect(previousCpuNotify).toEqual({
      enable: true,
      max_memory: 10,
      max_cpu: 11,
      max_cpu_temp: 30,
      report_enable: false,
      report_schedule: ''
    })
    expect(m.state.notify).not.toBe(previousCpuNotify)
    m.setState({ notify: { ...m.state.notify, enable: true } })
    expect(update).toHaveBeenCalled()
  })

  it('<About /> mounts and renders info', () => {
    const info = { current_time: '2026-04-18', version: '2.0', uptime: '1 day', ip: '192.168.1.1', model: 'Pi 4' }
    const component = new RawAbout({ info, fetchInfo: jest.fn(), errors: [] })
    patchSetState(component)
    expect(renderToStaticMarkup(component.render())).toContain('reef-pi')
    component.componentWillUnmount()
  })

  it('<About /> mounts with empty info', () => {
    const component = new RawAbout({ info: {}, fetchInfo: jest.fn(), errors: [] })
    patchSetState(component)
    expect(renderToStaticMarkup(component.render())).toContain('reef-pi')
    component.componentWillUnmount()
  })

  it('<Errors /> mounts with error list renders items and handles clear', () => {
    const clear = jest.fn()
    const component = new RawErrors({
      errors: [
        { id: '1', time: '2026-04-18', message: 'something broke', count: 1 },
        { id: 'alert:2', time: '2026-04-18', message: 'alert item', count: 3 }
      ],
      clear,
      fetch: jest.fn(),
      delete: jest.fn()
    })
    component.componentDidMount()
    component.handleClear()
    expect(clear).toHaveBeenCalled()
    expect(renderToStaticMarkup(component.render())).toContain('alert item')
  })

  it('<Errors /> mounts with empty error list', () => {
    const component = new RawErrors({ errors: [], clear: jest.fn(), fetch: jest.fn(), delete: jest.fn() })
    expect(renderToStaticMarkup(component.render())).toContain('btn btn-outline-secondary')
  })

  it('<Errors /> delete button dispatches deleteError', () => {
    const deleteError = jest.fn()
    const component = new RawErrors({
      errors: [{ id: '1', time: '2026-04-18', message: 'err', count: 1 }],
      clear: jest.fn(),
      fetch: jest.fn(),
      delete: deleteError
    })
    const row = component.render().props.children[0][0]
    row.props.children[2].props.children.props.onClick()
    expect(deleteError).toHaveBeenCalledWith('1')
  })
})
