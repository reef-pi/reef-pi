import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { thunk } from 'redux-thunk'
import { RawTimersMain } from './main'
import TimerForm from './timer_form'
import Collapsible from '../ui_components/collapsible'
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

const findNodes = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => {
    findNodes(child, predicate, acc)
  })
  return acc
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
    const timers = [
      { ...timerData, id: '1', name: 'timer B' },
      { ...timerData, id: '2', name: 'timer A' }
    ]
    const component = new RawTimersMain(makeProps({ timers }))
    const items = component.timerList()

    expect(items).toHaveLength(2)
    expect(items[0].props.name).toBe('panel-timer-2')
    expect(timers.map(item => item.name)).toEqual(['timer B', 'timer A'])
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

  it('<Main /> updates timers using normalized payloads', () => {
    const props = makeProps({ update: jest.fn() })
    const component = new RawTimersMain(props)

    component.handleUpdateTimer({
      ...timerData,
      id: 'timer-id',
      month: '*',
      week: '*',
      target: {
        id: 'eq-1',
        on: false,
        duration: '45',
        revert: false
      }
    })

    expect(props.update).toHaveBeenCalledWith('timer-id', {
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
        id: 'eq-1',
        on: false,
        duration: 45,
        revert: false
      }
    })
  })

  it('<Main /> leaves timer target duration absent when not provided', () => {
    const component = new RawTimersMain(makeProps())

    expect(component.valuesToTimer({
      name: 'reminder',
      type: 'reminder',
      month: '*',
      week: '*',
      day: '*',
      hour: '12',
      minute: '30',
      second: '0',
      enable: true,
      target: { title: 'Dose', message: 'Check pump' }
    }).target).toEqual({ title: 'Dose', message: 'Check pump' })
  })

  it('<Main /> timer list toggle flips enable state and updates timer', () => {
    const timer = { ...timerData, enable: false }
    const props = makeProps({ timers: [timer], update: jest.fn() })
    const component = new RawTimersMain(props)

    component.timerList()[0].props.onToggleState()

    expect(timer.enable).toBe(true)
    expect(props.update).toHaveBeenCalledWith('1', timer)
  })

  it('<Main /> renders add form and add button state when addTimer is true', () => {
    const component = new RawTimersMain(makeProps({ timers: [] }))
    component.state.addTimer = true

    const rendered = component.render()
    const addButton = findNodes(rendered, node => node.type === 'input' && node.props.id === 'add_timer')[0]
    const form = findNodes(rendered, node => node.type === TimerForm)[0]

    expect(addButton.props.value).toBe('-')
    expect(form.props.onSubmit).toBe(component.handleSubmit)
    expect(form.props.equipment).toBe(component.props.equipment)
    expect(form.props.macros).toBe(component.props.macros)
  })

  it('<Main /> passes readOnly timer setting to TimerForm', () => {
    const timer = { ...timerData, readOnly: true }
    const component = new RawTimersMain(makeProps({ timers: [timer] }))
    const panel = component.timerList()[0]
    const form = findNodes(panel, node => node.type === TimerForm)[0]

    expect(panel.type).toBe(Collapsible)
    expect(form.props.readOnly).toBe(true)
    expect(form.props.timer).toBe(timer)
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
