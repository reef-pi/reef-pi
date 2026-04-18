import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import Main from './main'
import TimerForm from './timer_form'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'

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

const timerData = {
  id: '1',
  name: 'foo',
  enable: false,
  type: 'equipment',
  equipment: { id: '1', on: true, revert: true, duration: 10 },
  reminder: { title: '', message: '' },
  day: '*',
  hour: '*',
  minute: '*',
  second: '0',
  duration: 10
}

describe('Timer ui', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty timers', () => {
    fetchMock.get('/api/timers', [])
    const store = mockStore({ timers: [], equipment: [], macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with timers', () => {
    fetchMock.get('/api/timers', [timerData])
    const store = mockStore({ timers: [timerData], equipment: [], macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper.find('ul.list-group').length).toBeGreaterThan(0)
    wrapper.unmount()
  })

  it('<Main /> toggles add timer form', () => {
    fetchMock.get('/api/timers', [])
    const store = mockStore({ timers: [], equipment: [], macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#add_timer').simulate('click')
    wrapper.find('#add_timer').simulate('click')
    wrapper.unmount()
  })

  it('<Main /> delete timer triggers confirm', () => {
    fetchMock.get('/api/timers', [])
    fetchMock.delete('/api/timers/1', {})
    const store = mockStore({ timers: [timerData], equipment: [], macros: [] })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    wrapper.find('#delete-panel-timer-1').simulate('click')
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main />', () => {
    const state = {
      timers: [timerData],
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
