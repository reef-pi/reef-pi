import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Channel from './channel'
import Chart from './chart'
import Main from './main'
import Light from './light'
import AutoProfile from './auto_profile'
import DiurnalProfile from './diurnal_profile'
import FixedProfile from './fixed_profile'
import Profile from './profile'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import {mockLocalStorage} from '../utils/test_helper'
window.localStorage = mockLocalStorage()

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Lighting ui', () => {
  const ev = {
    target: {value: 10}
  }
  const light = {
    id: '1',
    name: 'foo',
    jack: '1',
    channels: {
      '1': {
        pin: 0,
        profile: {
          type: 'auto',
          config: {values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
        }
      }
    }
  }
  it('<Main />', () => {
    const jacks = [{id: '1', name: 'foo'}]
    const m = shallow(<Main store={mockStore({lights: [light], jacks: jacks})} />).dive().instance()
    m.setJack(0, {})
    m.toggleAddLightDiv()
    m.addLight()
    m.removeLight('1')()
  })

  it('<Light />', () => {
    const m = shallow(<Light config={light} hook={() => {}} remove={() => true} />).instance()
    m.expand()
    m.updateValues('1', [])
    m.getValues('1')()
    m.setLightMode('1')({target: {}})
    m.updateChannel('1')(light.channels['1'])
    m.updateLight()
    m.updateLight()
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({lights: [light]})} light_id='1' />).dive()
  })

  it('<Channel />', () => {
    const m = shallow(<Channel config={light.channels['1']} hook={() => {}} />).instance()
    m.toggle()
    m.updateMin({target: {}})
    m.updateMax({target: {}})
    m.updateReverse({target: {}})
    m.updateName({target: {}})
    m.updateStartMin(ev)
    m.updateColor({hex: '#fff'})
  })

  it('<AutoProfile />', () => {
    const m = shallow(<AutoProfile hook={() => true} />).instance()
    m.curry(1)(ev)
  })

  it('<DiurnalProfile />', () => {
    const m = shallow(<DiurnalProfile hook={() => true} />).instance()
    m.update('foo')(ev)
  })

  it('<FiexdProfile />', () => {
    const m = shallow(<FixedProfile hook={() => true} />).instance()
    m.update(ev)
  })

  it('<Profile />', () => {
    const m = shallow(<Profile hook={() => true} type='fixed' />).instance()
    m.setConfig({})
    m.setType('fixed')()
    shallow(<Profile type='auto' />)
    shallow(<Profile type='diurnal' />)
    shallow(<Profile type='unknown' />)
  })
})
