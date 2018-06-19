import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import AdafruitIO from './adafruit_io'
import Notification from './notification'
import thunk from 'redux-thunk'
import {mockLocalStorage} from '../utils/test_helper'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

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
      adafruitio: aio
    }
    const m = shallow(<Main store={mockStore({telemetry: telemetry})} />).dive().instance()
    m.updateMailer(mailer)
    m.updateAio(aio)
    m.updateThrottle({target: { value: 20 }})
    m.save()
  })

  it('<AdafruitIO />', () => {
    const m = shallow(<AdafruitIO adafruitio={{}} update={() => true} />).instance()
    m.updateEnable({target: {checked: true}})
  })

  it('<Main />', () => {
    shallow(<Notification mailer={{}} />)
  })
})
