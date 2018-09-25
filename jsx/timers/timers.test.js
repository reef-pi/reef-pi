import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import Cron from './cron'
import Equipment from './equipment'
import Reminder from './reminder'
import Timer from './timer'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
jest.mock('utils/confirm', () => {
  return {
    confirm: jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        return resolve(true)
      })
    })
  }
})
describe('Timer ui', () => {
  it('<Main />', () => {
    const state = {
      timers: [
        {
          id: '1',
          name: 'foo',
          enable: true,
          type: 'equipment',
          equipment: { id: '1', on: true, revert: true, duration: 10 },
          reminder: { title: '', message: '' },
          day: '*',
          hour: '*',
          minute: '*',
          second: '0',
          duration: 10
        }
      ],
      equipment: [{ id: '1', name: 'bar', on: false }]
    }
    const m = shallow(<Main store={mockStore(state)} />)
      .dive()
      .instance()
    m.toggleAddTimerDiv()
    m.removeTimer('1')()
    m.setType('reminder')()
    m.update('name')('foo')
    m.updateCron({ day: '*', minute: '*', hour: '*', second: '0' })
    m.createTimer()
    m.state.name = ''
    m.createTimer()
    m.state.name = 'foo'
    m.state.day = ''
    m.createTimer()
    m.state.day = '*'
    m.state.hour = ''
    m.createTimer()
    m.state.hour = '*'
    m.state.minute = ''
    m.createTimer()
    m.state.minute = '*'
    m.state.second = ''
    m.createTimer()
    m.state.second = '*'
    m.state.type = 'equipment'
    delete m.state.equipment
    m.createTimer()
    m.state.equipment = { id: '1', on: true, revert: true, duration: 10 }
    m.createTimer()
    m.props.delete(1)
    m.props.update(1, {})
  })

  it('<Cron />', () => {
    const m = shallow(
      <Cron disabled={false} update={() => true} id_prefix='' day='*' hour='*' minute='*' second='0' />
    ).instance()
    m.update('foo')({ target: {} })
  })

  it('<Equipment />', () => {
    const m = shallow(
      <Equipment
        equipment={[{ id: '1', name: 'foo' }]}
        update={() => true}
        id_prefix=''
        disabled={false}
        active_id='1'
        revert
        on
        duration={10}
      />
    ).instance()
    m.set(0)()
    m.setAction('off')()
    const ev = {
      target: {
        value: 20,
        checked: true
      }
    }
    m.setDuration(ev)
    m.setRevert(ev)
  })

  it('<Reminder />', () => {
    const m = shallow(<Reminder update={() => true} disabled={false} title='' id_prefix='' message='' />).instance()
    m.update('title')({ target: { value: 'test' } })
  })

  it('<Timer />', () => {
    const t = shallow(
      <Timer
        timer_id=''
        name='foo'
        type='equipment'
        enable
        equipment={{
          on: true,
          name: 'TestEquipment',
          duration: 20,
          id: '1',
          revert: false
        }}
        reminder={{ message: '', title: '' }}
        day='*'
        hour='*'
        minute='*'
        second='*'
        remove={() => true}
        update={() => true}
        equipmentList={[]}
      />
    ).instance()
    t.trigger()
    t.update()
    t.setType('reminder')()
    t.trigger()
    t.set('foo')('bar')
    t.details()
    t.updateCron({ day: '*', minute: '*', hour: '*', second: '0' })
    t.update()

    const v = shallow(
      <Timer
        timer_id=''
        name='foo'
        type='equipment'
        enable
        active_id='1'
        expand
        equipment={{
          on: true,
          name: 'TestEquipment',
          duration: 20,
          id: '1',
          revert: true
        }}
        reminder={{ message: '', title: '' }}
        day='*'
        hour='*'
        minute='*'
        second='*'
        remove={() => true}
        update={() => true}
        equipmentList={[
          {
            on: true,
            name: 'TestEquipment',
            duration: 20,
            id: '1',
            revert: false
          },
          {
            on: true,
            name: 'TestEquipment',
            duration: 20,
            id: '2',
            revert: false
          }
        ]}
      />
    )
      .instance()
    v.set('expand')(true)
  })
})
