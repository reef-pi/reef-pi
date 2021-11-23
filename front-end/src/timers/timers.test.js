import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import TimerForm from './timer_form'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
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
  })

  it('<TimerForm /> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<TimerForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<TimerForm /> for edit', () => {
    const fn = jest.fn()

    const timer = {
      name: 'name',
      enable: true,
      day: '*',
      hour: '*',
      minute: '*',
      second: '0',
      type: 'equipment',
      target: {
        equipment_id: '2',
        on: true,
        duration: 60,
        revert: false,
      },
      title: '',
      message: ''
    }
    const wrapper = shallow(<TimerForm timer={timer} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })
})
