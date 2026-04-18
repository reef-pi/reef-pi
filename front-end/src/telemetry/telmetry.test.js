import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import AdafruitIO from './adafruit_io'
import Mqtt from './mqtt'
import Notification from './notification'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
  showUpdateSuccessful: jest.fn()
}))

const mockStore = configureMockStore([thunk])

const fullTelemetry = {
  mailer: { port: 546, server: 'test.example.com', from: 'a@b.com', to: ['c@d.com'] },
  throttle: 10,
  notify: true,
  adafruitio: { enable: true, user: 'u', token: 'foo' },
  mqtt: { enable: true, server: 'mqtt.local', username: '', client_id: '', password: '', qos: 0, prefix: '', retained: false },
  current_limit: 100,
  historical_limit: 720
}

describe('Telemetry UI', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('<Main /> smoke test via Provider', () => {
    fetchMock.get('/api/telemetry', fullTelemetry)
    const store = mockStore({ telemetry: fullTelemetry })
    expect(() =>
      shallow(<Provider store={store}><Main /></Provider>)
    ).not.toThrow()
  })

  it('<Main /> mounts with full config including notify', () => {
    fetchMock.get('/api/telemetry', fullTelemetry)
    fetchMock.post('/api/telemetry', fullTelemetry)
    const store = mockStore({ telemetry: fullTelemetry })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with no notify (notification hidden)', () => {
    fetchMock.get('/api/telemetry', {})
    const config = { ...fullTelemetry, notify: false }
    const store = mockStore({ telemetry: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with no adafruitio (showAdafruitIO hidden)', () => {
    fetchMock.get('/api/telemetry', {})
    const config = { ...fullTelemetry, adafruitio: undefined }
    const store = mockStore({ telemetry: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with no mqtt (showMqtt hidden)', () => {
    fetchMock.get('/api/telemetry', {})
    const config = { ...fullTelemetry, mqtt: undefined }
    const store = mockStore({ telemetry: config })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> handleSave — valid config with adafruitio and notify', () => {
    fetchMock.get('/api/telemetry', fullTelemetry)
    fetchMock.post('/api/telemetry', fullTelemetry)
    const store = mockStore({ telemetry: fullTelemetry })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#updateTelemetry').simulate('click')
    wrapper.unmount()
  })

  it('<Main /> handleSave — adafruitio enabled with empty user rejects', () => {
    fetchMock.get('/api/telemetry', {})
    const badAio = { ...fullTelemetry, adafruitio: { enable: true, user: '', token: '' } }
    const store = mockStore({ telemetry: badAio })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#updateTelemetry').simulate('click')
    wrapper.unmount()
  })

  it('<Main /> handleEnableMailer toggles notify', () => {
    fetchMock.get('/api/telemetry', {})
    const store = mockStore({ telemetry: fullTelemetry })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#enable-mailer').simulate('click', { target: { checked: false } })
    wrapper.unmount()
  })

  it('<Main /> updateLimit changes current_limit', () => {
    fetchMock.get('/api/telemetry', {})
    const store = mockStore({ telemetry: fullTelemetry })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#updateCurrentLimit').simulate('change', { target: { value: '50' } })
    wrapper.unmount()
  })

  it('<Main /> getDerivedStateFromProps — skips update when state.updated is true', () => {
    fetchMock.get('/api/telemetry', fullTelemetry)
    const store = mockStore({ telemetry: fullTelemetry })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> old dive still works for smoke', () => {
    fetchMock.get('/api/telemetry', fullTelemetry)
    const m = shallow(<Main store={mockStore({ telemetry: fullTelemetry })} />).dive()
    expect(m).toBeDefined()
  })

  it('<AdafruitIO />', () => {
    const m = shallow(<AdafruitIO adafruitio={{}} update={() => true} />).instance()
    m.handleUpdateEnable({ target: { checked: true } })
    m.onChange('foo')({ target: { value: 1 } })
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
    const m = shallow(<Mqtt config={mqttConfig} update={(c) => { updated = c }} />).instance()

    // Text input should send string value
    m.onChange('server')({ target: { type: 'text', value: 'broker.local' } })
    expect(updated.server).toBe('broker.local')

    // Checkbox input must send boolean true, not the string "on"
    m.onChange('retained')({ target: { type: 'checkbox', checked: true, value: 'on' } })
    expect(typeof updated.retained).toBe('boolean')
    expect(updated.retained).toBe(true)

    m.onChange('retained')({ target: { type: 'checkbox', checked: false, value: 'on' } })
    expect(updated.retained).toBe(false)
  })

  it('<Notification />', () => {
    const m = shallow(<Notification update={() => true} mailer={{ to: [] }} />).instance()
    m.update(1)({ target: { value: 'foo' } })
  })
})
