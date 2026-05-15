import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RawTelemetry as Main } from './main'
import AdafruitIO from './adafruit_io'
import Mqtt from './mqtt'
import Notification from './notification'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

describe('Telemetry UI', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showSuccess')
    jest.spyOn(Alert, 'showUpdateSuccessful')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const makeMain = (props = {}) => {
    const mailer = {
      port: 546,
      server: 'test.example.com',
      from: 'reef@example.com',
      to: ['reefer@example.com']
    }
    const aio = {
      enable: true,
      user: 'u',
      token: 'foo',
      prefix: 'reef'
    }
    const mqtt = {
      enable: true,
      server: 'mqtt.example.com',
      username: '',
      client_id: '',
      password: '',
      qos: 0,
      prefix: '',
      retained: false
    }
    const telemetry = {
      mailer: mailer,
      throttle: 10,
      notify: true,
      adafruitio: aio,
      mqtt: mqtt,
      current_limit: 100,
      historical_limit: 720
    }
    const instance = new Main({
      config: telemetry,
      fetch: jest.fn(),
      update: jest.fn(),
      sendTestMessage: jest.fn(),
      ...props
    })
    instance.setState = update => {
      const next = typeof update === 'function' ? update(instance.state, instance.props) : update
      instance.state = { ...instance.state, ...next }
    }
    return instance
  }

  it('<Main />', () => {
    const m = makeMain()
    expect(m).toBeInstanceOf(Main)

    const derived = Main.getDerivedStateFromProps({ config: m.props.config }, m.state)
    expect(derived.config).toEqual(m.props.config)

    m.componentDidMount()
    expect(m.props.fetch).toHaveBeenCalled()

    m.handleEnableMailer({ target: { checked: false } })
    expect(m.state.config.notify).toBe(false)

    m.updateLimit('current_limit')({ target: { value: '42' } })
    expect(m.state.config.current_limit).toBe('42')

    m.handleUpdateThrottle({ target: { value: '15' } })
    expect(m.state.config.throttle).toBe('15')

    m.handleTestMessage()
    expect(m.props.sendTestMessage).toHaveBeenCalled()

    m.updateAio({ enable: true, user: 'u2', token: 'bar', prefix: 'reef' })
    expect(m.state.config.adafruitio.user).toBe('u2')

    m.updateMqtt({ enable: true, server: 'broker.local', qos: 1, retained: true })
    expect(m.state.config.mqtt.server).toBe('broker.local')

    m.updateMailer({ server: 'smtp.local', port: '2525', from: 'reef@example.com', to: ['reef@example.com'] })
    expect(m.state.config.mailer.server).toBe('smtp.local')

    m.handleSave()
    expect(m.props.update).toHaveBeenCalledWith(expect.objectContaining({
      current_limit: 42,
      historical_limit: 720,
      throttle: '15'
    }))

    const markup = renderToStaticMarkup(m.render())
    expect(markup).toContain('updateTelemetry')
  })

  it('<Main /> updates telemetry config without mutating previous state', () => {
    const m = makeMain()
    const previousConfig = m.state.config

    m.handleEnableMailer({ target: { checked: false } })

    expect(previousConfig.notify).toBeUndefined()
    expect(m.state.config.notify).toBe(false)
    expect(m.state.config).not.toBe(previousConfig)
  })

  it('<Main /> skips derived state when config is missing or local edits are pending', () => {
    const m = makeMain()
    m.state.updated = true

    expect(Main.getDerivedStateFromProps({ config: undefined }, m.state)).toBeNull()
    expect(Main.getDerivedStateFromProps({ config: m.props.config }, m.state)).toBeNull()
  })

  it('<Main /> hides optional sections when config blocks are missing or disabled', () => {
    const m = makeMain()

    m.state.config = undefined
    expect(m.notification()).toBeUndefined()
    expect(m.showAdafruitIO()).toBeUndefined()
    expect(m.showMqtt()).toBeUndefined()

    m.state.config = { mailer: undefined, notify: true }
    expect(m.notification()).toBeUndefined()

    m.state.config = { mailer: {}, notify: false }
    expect(m.notification()).toBeUndefined()

    m.state.config = { adafruitio: undefined, mqtt: undefined, mailer: {}, notify: false }
    expect(m.showAdafruitIO()).toBeUndefined()
    expect(m.showMqtt()).toBeUndefined()
  })

  it('<Main /> rejects invalid adafruit.io settings before saving', () => {
    const update = jest.fn()
    const m = makeMain({ update })
    m.state.config = {
      ...m.props.config,
      adafruitio: { ...m.props.config.adafruitio, user: '' }
    }

    m.handleSave()
    expect(Alert.showError).toHaveBeenCalledWith('Please set a valid adafruit.io user')
    expect(update).not.toHaveBeenCalled()

    m.state.config.adafruitio = { ...m.props.config.adafruitio, token: '' }
    m.handleSave()
    expect(Alert.showError).toHaveBeenCalledWith('Please set a valid adafruit.io key')
    expect(update).not.toHaveBeenCalled()
  })

  it('<Main /> rejects invalid mailer settings before saving', () => {
    const update = jest.fn()
    const m = makeMain({ update })
    m.state.config = {
      ...m.props.config,
      notify: true,
      mailer: {
        server: '',
        port: '25',
        from: '',
        to: []
      }
    }

    m.handleSave()

    expect(Alert.showError).toHaveBeenCalledWith('Please set a valid mail server')
    expect(Alert.showError).toHaveBeenCalledWith('Please set a valid mail sender (From)')
    expect(Alert.showError).toHaveBeenCalledWith('Please set a valid mail recipient (To)')
    expect(update).not.toHaveBeenCalled()
  })

  it('<Main /> renders notification controls and sends test messages', () => {
    const m = makeMain()
    m.state = { ...m.state, ...Main.getDerivedStateFromProps({ config: m.props.config }, m.state) }
    const notification = m.notification()

    expect(notification.props.className).toBe('row')
    expect(renderToStaticMarkup(notification)).toContain('send-test-email')

    m.handleTestMessage()
    expect(m.props.sendTestMessage).toHaveBeenCalled()
    expect(Alert.showSuccess).toHaveBeenCalled()
  })

  it('<Main /> saves parsed telemetry config without mutating state config', () => {
    const update = jest.fn()
    const m = makeMain({ update })
    const derived = Main.getDerivedStateFromProps({ config: m.props.config }, m.state)
    m.state = { ...m.state, ...derived }
    m.setState({
      config: {
      ...m.state.config,
      current_limit: '100',
      historical_limit: '720',
      throttle: '10',
      mailer: {
        ...m.state.config.mailer,
        port: '546'
      }
      }
    })
    const previousConfig = m.state.config
    const previousMailer = m.state.config.mailer

    m.handleSave()

    expect(previousConfig.current_limit).toBe('100')
    expect(previousConfig.mailer.port).toBe('546')
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      current_limit: 100,
      historical_limit: 720,
      throttle: 10,
      mailer: expect.objectContaining({ port: 546 })
    }))
    expect(update.mock.calls[0][0]).not.toBe(previousConfig)
    expect(update.mock.calls[0][0].mailer).not.toBe(previousMailer)
  })

  it('<AdafruitIO />', () => {
    let updated = {}
    const m = new AdafruitIO({
      adafruitio: {},
      update: c => { updated = c }
    })
    m.setState = update => {
      const next = typeof update === 'function' ? update(m.state, m.props) : update
      m.state = { ...m.state, ...next }
    }
    m.handleUpdateEnable({ target: { checked: true } })
    expect(updated.enable).toBe(true)
    m.onChange('foo')({ target: { value: 1 } })
    expect(updated.foo).toBe(1)
  })

  it('<AdafruitIO /> updates without mutating previous state', () => {
    const adafruitio = { enable: true, user: 'u', token: 'foo', prefix: 'reef' }
    let updated = {}
    const m = new AdafruitIO({
      adafruitio,
      update: c => { updated = c }
    })
    m.setState = update => {
      const next = typeof update === 'function' ? update(m.state, m.props) : update
      m.state = { ...m.state, ...next }
    }
    const previous = m.state.adafruitio

    m.onChange('user')({ target: { value: 'u2' } })

    expect(previous.user).toBe('u')
    expect(m.state.adafruitio).not.toBe(previous)
    expect(updated.user).toBe('u2')
  })

  it('<Mqtt /> onChange sends boolean for checkbox, string for text', () => {
    const mqttConfig = {
      enable: true,
      server: 'mqtt.example.com',
      username: '',
      client_id: '',
      password: '',
      qos: 0,
      prefix: '',
      retained: false
    }
    let updated = {}
    const m = new Mqtt({ config: mqttConfig, update: (c) => { updated = c } })
    m.setState = update => {
      const next = typeof update === 'function' ? update(m.state, m.props) : update
      m.state = { ...m.state, ...next }
    }

    m.onChange('server')({ target: { type: 'text', value: 'broker.local' } })
    expect(updated.server).toBe('broker.local')

    m.onChange('retained')({ target: { type: 'checkbox', checked: true, value: 'on' } })
    expect(typeof updated.retained).toBe('boolean')
    expect(updated.retained).toBe(true)

    m.onChange('retained')({ target: { type: 'checkbox', checked: false, value: 'on' } })
    expect(updated.retained).toBe(false)
  })

  it('<Mqtt /> updates without mutating previous state', () => {
    const mqttConfig = {
      enable: true,
      server: 'mqtt.example.com',
      username: '',
      client_id: '',
      password: '',
      qos: 0,
      prefix: '',
      retained: false
    }
    let updated = {}
    const m = new Mqtt({ config: mqttConfig, update: (c) => { updated = c } })
    m.setState = update => {
      const next = typeof update === 'function' ? update(m.state, m.props) : update
      m.state = { ...m.state, ...next }
    }
    const previous = m.state.config

    m.onChange('server')({ target: { type: 'text', value: 'broker.local' } })

    expect(previous.server).toBe('mqtt.example.com')
    expect(m.state.config).not.toBe(previous)
    expect(updated.server).toBe('broker.local')
  })

  it('<Notification />', () => {
    let updated = {}
    const m = new Notification({
      update: c => { updated = c },
      mailer: { to: [], server: '', port: '', from: '', username: '', password: '' }
    })
    m.setState = update => {
      const next = typeof update === 'function' ? update(m.state, m.props) : update
      m.state = { ...m.state, ...next }
    }
    m.update(1)({ target: { value: 'foo' } })
    expect(updated[1]).toBe('foo')
    m.updateTo()({ target: { value: 'a@example.com, b@example.com' } })
    expect(updated.to).toEqual(['a@example.com', 'b@example.com'])
  })

  it('<Notification /> updates without mutating previous state', () => {
    const mailer = { server: 'smtp.example.com', port: 25, from: 'reef@example.com', to: ['old@example.com'] }
    let updated = {}
    const m = new Notification({ mailer, update: (c) => { updated = c } })
    m.setState = update => {
      const next = typeof update === 'function' ? update(m.state, m.props) : update
      m.state = { ...m.state, ...next }
    }
    const previous = m.state.config

    m.update('server')({ target: { value: 'smtp.local' } })

    expect(previous.server).toBe('smtp.example.com')
    expect(m.state.config).not.toBe(previous)
    expect(updated.server).toBe('smtp.local')
  })
})
