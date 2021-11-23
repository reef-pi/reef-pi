import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import AdafruitIO from './adafruit_io'
import Notification from './notification'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
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

  it('<Notification />', () => {
    const m = shallow(<Notification update={() => true} mailer={{ to: [] }} />).instance()
    m.update(1)({ target: { value: 'foo' } })
  })
})
