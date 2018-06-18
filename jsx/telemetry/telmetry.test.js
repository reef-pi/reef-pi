import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store'
import Main from './main'
import AdafruitIO from './adafruit_io'
import Notification from './notification'

Enzyme.configure({ adapter: new Adapter() })
const mockStore =  configureMockStore()

describe('Telemetry UI', () => {
  it('<Main />', () => {
    shallow(<Main store={mockStore()}/>)
  })

  it('<AdafruitIO />', () => {
    shallow(<AdafruitIO adafruitio={{}}/>)
  })

  it('<Main />', () => {
    shallow(<Notification mailer={{}}/>)
  })
})

