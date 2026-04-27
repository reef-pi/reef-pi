import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { RawTimersMain } from './main'
import TimerForm from './timer_form'
import 'isomorphic-fetch'

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

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mockStore = configureMockStore([thunk])

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
  const makeProps = (extra = {}) => ({
    timers: [timerData],
    equipment: [{ id: '1', name: 'bar', on: false }],
    macros: [],
    fetch: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    ...extra
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Main /> fetches timers on mount', () => {
    const props = makeProps()
    const component = new RawTimersMain(props)

    component.componentDidMount()

    expect(props.fetch).toHaveBeenCalled()
  })

  it('<Main /> renders timers when present', () => {
    const component = new RawTimersMain(makeProps())
    const items = component.timerList()

    expect(items).toHaveLength(1)
    expect(items[0].props.name).toBe('panel-timer-1')
  })

  it('<Main /> toggles add timer form', () => {
    const component = new RawTimersMain(makeProps({ timers: [] }))
    component.setState = update => { component.state = { ...component.state, ...update } }

    component.handleToggleAddTimerDiv()
    expect(component.state.addTimer).toBe(true)

    component.handleToggleAddTimerDiv()
    expect(component.state.addTimer).toBe(false)
  })

  it('<Main /> delete timer triggers confirm and delete', async () => {
    const props = makeProps()
    const component = new RawTimersMain(props)

    component.handleRemoveTimer(timerData)
    await Promise.resolve()

    expect(props.delete).toHaveBeenCalledWith('1')
  })

  it('<Main /> creates timers using normalized payloads', () => {
    const props = makeProps({ create: jest.fn(), timers: [] })
    const component = new RawTimersMain(props)
    component.setState = update => { component.state = { ...component.state, ...update } }
    const formValues = {
      ...timerData,
      month: '*',
      week: '*',
      target: {
        id: '1',
        on: true,
        duration: '10',
        revert: true
      }
    }

    component.handleToggleAddTimerDiv()
    component.handleSubmit(formValues)

    expect(props.create).toHaveBeenCalledWith({
      name: 'foo',
      type: 'equipment',
      month: '*',
      week: '*',
      day: '*',
      hour: '*',
      minute: '*',
      second: '0',
      enable: false,
      target: {
        id: '1',
        on: true,
        duration: 10,
        revert: true
      }
    })
    expect(component.state.addTimer).toBe(false)
  })

  it('<TimerForm /> for create', () => {
    const fn = jest.fn()
    const store = mockStore({ equipment: [], macros: [] })
    const html = renderToStaticMarkup(
      <Provider store={store}>
        <TimerForm onSubmit={fn} />
      </Provider>
    )

    expect(html).toContain('name="name"')
    expect(html).toContain('name="target.duration"')
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
    const store = mockStore({ equipment: [], macros: [] })
    const html = renderToStaticMarkup(
      <Provider store={store}>
        <TimerForm timer={timer} onSubmit={fn} />
      </Provider>
    )

    expect(html).toContain('value="name"')
    expect(html).toContain('name="target.duration"')
  })
})
