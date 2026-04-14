import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Admin, { AdminView } from './admin'
import Capabilities from './capabilities'
import Display, { DisplayView } from './display'
import Errors, { ErrorsView } from './errors'
import About, { AboutView } from './about'
import HealthNotify from './health_notify'
import Main, { configRoutes } from './main'
import Settings, { SettingsView } from './settings'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import FormData from 'form-data'
import SignIn from 'sign_in'
import * as Alert from '../utils/alert'
import i18n from 'utils/i18n'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockResolvedValue(true)
}))

describe('Configuration ui', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.restoreAllMocks()
  })

  it('<Main /> exposes expected config routes', () => {
    expect(Main).toBeDefined()
    const labels = configRoutes.map(route => route.label)
    expect(labels).toContain(i18n.t('configuration:tab:settings'))
    expect(labels).toContain(i18n.t('configuration:tab:connectors'))
    expect(labels).toContain(i18n.t('configuration:tab:admin'))
  })

  it('<AdminView /> handles actions', async () => {
    const reload = jest.fn()
    const reboot = jest.fn()
    const powerOff = jest.fn()
    const dbImport = jest.fn()
    const upgrade = jest.fn()
    SignIn.logout = jest.fn().mockReturnValue(true)
    const showError = jest.spyOn(Alert, 'showError').mockImplementation(() => {})
    const showUpdateSuccessful = jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
    jest.spyOn(FormData.prototype, 'append').mockImplementation(() => {})

    const admin = new AdminView({ reload, reboot, powerOff, dbImport, upgrade })
    admin.setState = jest.fn(update => {
      admin.state = { ...admin.state, ...update }
    })

    admin.handleReload()
    admin.handlePowerOff()
    admin.handleReboot()
    admin.handleSignout()
    expect(SignIn.logout).toHaveBeenCalled()

    admin.handleInstall()
    expect(showError).toHaveBeenCalled()

    admin.handleVersionChange({ target: { value: '5.0.0' } })
    admin.handleInstall()
    await Promise.resolve()
    expect(upgrade).toHaveBeenCalledWith('5.0.0')
    expect(showUpdateSuccessful).toHaveBeenCalled()

    const file = { name: 'reef-pi.db' }
    admin.handleDBFileChange({ target: { files: [file] } })
    expect(admin.dbFileName()).toBe('reef-pi.db')
    admin.handleDBFileImport()
    await Promise.resolve()
    expect(dbImport).toHaveBeenCalled()
  })

  it('<DisplayView /> handles toggle and brightness', () => {
    const fetchDisplay = jest.fn()
    const switchDisplay = jest.fn()
    const setBrightness = jest.fn()
    const showUpdateSuccessful = jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})

    const display = new DisplayView({
      config: { brightness: 50, on: true },
      fetchDisplay,
      switchDisplay,
      setBrightness
    })
    display.setState = jest.fn(update => {
      display.state = { ...display.state, ...update }
    })

    display.componentDidMount()
    expect(fetchDisplay).toHaveBeenCalled()
    display.handleToggle()
    expect(switchDisplay).toHaveBeenCalledWith(true)
    expect(fetchDisplay).toHaveBeenCalledTimes(2)
    expect(showUpdateSuccessful).toHaveBeenCalled()

    display.handleSetBrightness({ target: { value: '120' } })
    expect(setBrightness).toHaveBeenCalledWith(120)
    expect(display.state.brightness).toBe(120)

    expect(() => renderToStaticMarkup(<DisplayView config={{ brightness: 120, on: false }} fetchDisplay={fetchDisplay} switchDisplay={switchDisplay} setBrightness={setBrightness} />)).not.toThrow()
    expect(Display).toBeDefined()
  })

  it('<Capabilities /> updates capability state', () => {
    const caps = {
      equipment: true,
      timer: false,
      dashboard: true
    }
    const update = jest.fn()
    const capabilities = new Capabilities({ capabilities: caps, update })
    capabilities.setState = jest.fn(updateState => {
      capabilities.state = { ...capabilities.state, ...updateState }
    })
    capabilities.updateCapability('dashboard')({ target: { checked: false } })
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ dashboard: false }))
  })

  it('<SettingsView /> handles protocol and updates', () => {
    const capabilities = { health_check: true }
    const settingsState = {
      name: 'reef-pi',
      interface: 'wlan0',
      address: 'localhost:80',
      https: false,
      display: false,
      cors: false,
      notification: false,
      pprof: false,
      prometheus: false,
      rpi_pwm_freq: 1000,
      capabilities,
      health_check: { enable: true, max_memory: 10, max_cpu: 20, max_cpu_temp: 30, report_enable: false, report_schedule: '' }
    }
    const fetchSettings = jest.fn()
    const updateSettings = jest.fn()
    const showUpdateSuccessful = jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})

    const settings = new SettingsView({
      settings: settingsState,
      capabilities,
      fetchSettings,
      updateSettings
    })
    settings.setState = jest.fn(update => {
      settings.state = { ...settings.state, ...update }
    })

    settings.componentDidMount()
    expect(fetchSettings).toHaveBeenCalled()

    settings.handleSetProtocolHttps()
    expect(settings.state.settings.https).toBe(true)
    expect(settings.state.settings.address).toBe('localhost')

    settings.state.settings.address = 'localhost:443'
    settings.handleSetProtocolHttp()
    expect(settings.state.settings.https).toBe(false)
    expect(settings.state.settings.address).toBe('localhost')

    settings.state.settings.address = 'localhost'
    settings.handleSetProtocolHttps()
    expect(settings.state.settings.address).toBe('localhost')

    settings.handleSetAddress({ target: { value: 'reef-pi.local:8080' } })
    expect(settings.state.settings.address).toBe('reef-pi.local:8080')

    settings.updateCheckbox('display')({ target: { checked: true } })
    expect(settings.state.settings.display).toBe(true)

    settings.updateCapabilities({ dashboard: true })
    expect(settings.state.settings.capabilities).toEqual({ dashboard: true })

    settings.updateHealthNotify({ enable: true })
    expect(settings.state.settings.health_check).toEqual({ enable: true })

    settings.state.settings.address = 'reef-pi.local:8080'
    settings.state.settings.capabilities = capabilities
    settings.state.settings.health_check = { enable: true, max_memory: 10, max_cpu: 20, max_cpu_temp: 30, report_enable: false, report_schedule: '' }
    settings.state.settings.display = false
    settings.handleUpdate()
    expect(updateSettings).toHaveBeenCalled()
    expect(showUpdateSuccessful).toHaveBeenCalled()

    expect(() => renderToStaticMarkup(
      <SettingsView settings={settingsState} capabilities={capabilities} fetchSettings={fetchSettings} updateSettings={updateSettings} />
    )).not.toThrow()
    expect(Settings).toBeDefined()
  })

  it('<HealthNotify /> updates values', () => {
    const update = jest.fn()
    const notify = new HealthNotify({
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
    notify.setState = jest.fn(next => {
      notify.state = { ...notify.state, ...next }
    })
    notify.handleUpdateEnable({ target: { checked: true } })
    notify.update('max_memory')({ target: { value: '42' } })
    notify.handleUpdateReportEnable({ target: { checked: true } })
    notify.update('report_schedule')({ target: { value: '0 8 * * *' } })
    expect(update).toHaveBeenCalled()
  })

  it('<AboutView /> renders and clears timer on unmount', () => {
    const fetchInfo = jest.fn()
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')
    const about = new AboutView({
      fetchInfo,
      info: { current_time: new Date(), version: 'test', uptime: '5 minutes', ip: 'localhost', model: 'Pi 5' },
      errors: []
    })

    expect(() => renderToStaticMarkup(
      <AboutView fetchInfo={fetchInfo} info={{ current_time: 'now', version: 'test', uptime: '5 minutes', ip: 'localhost', model: 'Pi 5' }} errors={[]} />
    )).not.toThrow()
    about.componentWillUnmount()
    expect(clearIntervalSpy).toHaveBeenCalledWith(about.state.timer)
    expect(About).toBeDefined()
  })

  it('<ErrorsView /> renders and clears errors', () => {
    const clear = jest.fn()
    const fetch = jest.fn()
    const del = jest.fn()
    const errorsView = new ErrorsView({
      errors: [{ id: 'alert:1', time: 'dd', message: 'dd', count: 2 }],
      clear,
      fetch,
      delete: del
    })
    errorsView.componentDidMount()
    expect(fetch).toHaveBeenCalled()
    errorsView.handleClear()
    expect(clear).toHaveBeenCalled()
    expect(() => renderToStaticMarkup(
      <ErrorsView errors={[{ id: '1', time: 'dd', message: 'dd', count: 1 }]} clear={clear} fetch={fetch} delete={del} />
    )).not.toThrow()
    expect(Errors).toBeDefined()
  })
})
