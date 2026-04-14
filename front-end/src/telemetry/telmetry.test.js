import React from 'react'
import { shallow } from 'enzyme'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import AdafruitIO from './adafruit_io'
import Mqtt from './mqtt'
import Notification from './notification'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

describe('Telemetry UI', () => {
  it('<Main />', () => {
    const mailer = {
      port: 546,
      server: 'test.example.com'
    }
    const aio = {
      enable: true,
      user: 'u',
      token: 'foo'
    }
    const telemetry = {
      mailer: mailer,
      throttle: 10,
      notify: true,
      adafruitio: aio
    }
    const m = shallow(<Main store={mockStore({ telemetry: telemetry })} />)
      .dive()
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
