import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Channel from './channel'
import Chart from './chart'
import Main from './main'
import Light from './light'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import {mockLocalStorage} from '../utils/test_helper'
window.localStorage = mockLocalStorage()

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Lighting ui', () => {
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
    m.updateLight()
    m.updateValues('1', [])
    m.setLightMode('1')({target: {}})
  })

  it('<Chart />', () => {
    shallow(<Chart store={mockStore({lights: [light]})} light_id='1' />).dive()
  })

  it('<Channel />', () => {
    const m = shallow(<Channel config={{values: []}} hook={() => {}} />).instance()
    m.updateMin({target: {}})
    m.updateMax({target: {}})
    m.updateReverse({target: {}})
    m.updateName({target: {}})
  })
})
