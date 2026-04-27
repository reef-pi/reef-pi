import React from 'react'
import Main, { RawTimersMain } from './main'
import TimerForm, { mapTimerPropsToValues, submitTimerForm } from './timer_form'

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
    jest.clearAllMocks()
  })

  it('<Main /> mounts with empty timers', () => {
    const main = new RawTimersMain({
      timers: [],
      equipment: [],
      macros: [],
      fetch: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    })
    expect(main.render().type).toBe('ul')
    expect(Main).toBeDefined()
  })

  it('<Main /> mounts with timers', () => {
    const main = new RawTimersMain({
      timers: [timerData],
      equipment: [],
      macros: [],
      fetch: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    })
    expect(main.timerList()).toHaveLength(1)
  })

  it('<Main /> toggles add timer form', () => {
    const main = new RawTimersMain({
      timers: [],
      equipment: [],
      macros: [],
      fetch: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    })
    main.setState = update => { main.state = { ...main.state, ...update } }
    main.handleToggleAddTimerDiv()
    expect(main.state.addTimer).toBe(true)
    main.handleToggleAddTimerDiv()
    expect(main.state.addTimer).toBe(false)
  })

  it('<Main /> delete timer triggers confirm', async () => {
    const del = jest.fn()
    const main = new RawTimersMain({
      timers: [timerData],
      equipment: [],
      macros: [],
      fetch: jest.fn(),
      create: jest.fn(),
      delete: del,
      update: jest.fn()
    })
    main.handleRemoveTimer(timerData)
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('<Main /> valuesToTimer and handlers', () => {
    const create = jest.fn()
    const update = jest.fn()
    const main = new RawTimersMain({
      timers: [timerData],
      equipment: [{ id: '1', name: 'bar', on: false }],
      macros: [],
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update
    })
    main.setState = nextState => { main.state = { ...main.state, ...nextState } }
    const values = {
      id: '1',
      name: 'foo',
      type: 'equipment',
      month: '*',
      week: '*',
      day: '*',
      hour: '*',
      minute: '*',
      second: '0',
      enable: false,
      target: { id: '1', on: true, duration: '10', revert: true }
    }
    const payload = main.valuesToTimer(values)
    expect(payload.target.duration).toBe(10)
    main.handleUpdateTimer(values)
    main.handleSubmit(values)
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'foo' }))
    expect(create).toHaveBeenCalled()
  })

  it('<TimerForm /> for create', () => {
    const fn = jest.fn()
    const values = mapTimerPropsToValues({})
    submitTimerForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
    expect(TimerForm).toBeDefined()
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
        revert: false
      },
      title: '',
      message: ''
    }
    const values = mapTimerPropsToValues({ timer })
    submitTimerForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ name: 'name' }))
  })
})
