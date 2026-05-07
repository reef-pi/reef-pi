import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RawTelemetry as Main } from './main'
import AdafruitIO from './adafruit_io'
import Mqtt from './mqtt'
import Notification from './notification'
import 'isomorphic-fetch'

describe('Telemetry UI', () => {
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
})
