import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import Cron from './cron'
import Equipment from './equipment'
import Reminder from './reminder'
import Timer from './timer'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
window.localStorage = mockLocalStorage()
const mockStore = configureMockStore([thunk])

describe('Timer ui', () => {
  it('<Main />', () => {
    const state = {
      timers: [{id: '1', name: 'foo', equipment: {id: '1'}}],
      equipments: [{id: '1', name: 'bar'}]
    }
    const m = shallow(<Main store={mockStore(state)} />).dive().instance()
    m.toggleAddTimerDiv()
    m.pickEquipment('1')
    m.createTimer()
    m.removeTimer('1')()
    m.setType('reminder')()
    m.update('foo')('bar')
  })

  it('<Cron />', () => {
    const m = shallow(<Cron />).instance()
    m.update('foo')({target: {}})
  })

  it('<Equipment />', () => {
    const m = shallow(<Equipment equipments={[{id: '1', name: 'foo'}]} updateHook={() => true} />).instance()
    m.updateRevert({target: {checked: true}})
    m.updateDuration({target: {value: '10'}})
    m.setEquipment(0)
    m.setEquipmentAction('off')
  })

  it('<Reminder />', () => {
    const m = shallow(<Reminder updateHook={() => true} />).instance()
    m.updateTitle({target: {}})
    m.updateMessage({target: {}})
  })

  it('<Timer />', () => {
    const config = {
      type: 'equipment',
      equipment: {
        on: true,
        name: 'TestEquipment',
        duration: 20
      }
    }
    shallow(<Timer config={config} />).instance()
  })
})
