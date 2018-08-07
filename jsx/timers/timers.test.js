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
      timers: [{
        id: '1',
        name: 'foo',
        enable: true,
        type: 'equipment',
        equipment: {id: '1', on: true, revert: true, duration: 10},
        reminder: {},
        day: '*',
        hour: '*',
        minute: '*',
        second: '0',
        duration: 10
      }],
      equipments: [{id: '1', name: 'bar'}]
    }
    const m = shallow(<Main store={mockStore(state)} />).dive().instance()
    m.toggleAddTimerDiv()
    m.createTimer()
    m.removeTimer('1')()
    m.setType('reminder')()
    m.update('foo')('bar')
  })

  it('<Cron />', () => {
    const m = shallow(
      <Cron
        disabled={false}
        update={() => true}
        id_prefix=''
        day='*'
        hour='*'
        minute='*'
        second='0'
      />).instance()
    m.update('foo')({target: {}})
  })

  it('<Equipment />', () => {
    const m = shallow(
      <Equipment
        equipments={[{id: '1', name: 'foo'}]}
        update={() => true}
        id_prefix=''
        disabled={false}
        active_id=''
        revert
        on
        duration={10}
      />).instance()
    m.set(0)
    m.setAction('off')
  })

  it('<Reminder />', () => {
    const m = shallow(<Reminder updateHook={() => true} />).instance()
    m.updateTitle({target: {}})
    m.updateMessage({target: {}})
  })

  it('<Timer />', () => {
    shallow(
      <Timer
        timer_id=''
        name='foo'
        type='equipment'
        enable
        equipment={{
          on: true,
          name: 'TestEquipment',
          duration: 20
        }}
        reminder={{}}
        day='*'
        hour='*'
        minute='*'
        second='*'

        remove={() => true}
        update={() => true}
        equipments={[]}
      />).instance()
  })
})
