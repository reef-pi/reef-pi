import React from 'react'
import { RawATOMain } from './main'
import 'isomorphic-fetch'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockImplementation(() => Promise.resolve(true))
}))

const ato = {
  id: '1', name: 'Top-off', enable: true,
  inlet: 'inlet1', period: 60, debounce: 0,
  control: true, pump: { id: 'pump1' },
  sensor: { readings: [] }
}
const equipment = [{ id: 'pump1', name: 'ATO Pump' }]
const inlets = [{ id: 'inlet1', name: 'Float Switch' }]
const macros = []

describe('ATO Main', () => {
  const makeProps = (extra = {}) => ({
    atos: [ato],
    equipment,
    inlets,
    macros,
    fetchATOs: jest.fn(),
    fetchEquipment: jest.fn(),
    fetchInlets: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    reset: jest.fn(),
    ...extra
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetches ATO dependencies on mount', () => {
    const props = makeProps()
    const component = new RawATOMain(props)

    component.componentDidMount()

    expect(props.fetchATOs).toHaveBeenCalled()
    expect(props.fetchEquipment).toHaveBeenCalled()
    expect(props.fetchInlets).toHaveBeenCalled()
  })

  it('renders a collapsible entry for each ATO', () => {
    const component = new RawATOMain(makeProps())
    const panels = component.probeList()

    expect(panels).toHaveLength(1)
    expect(panels[0].props.name).toBe('panel-ato-1')
  })

  it('renders with an empty ATO list', () => {
    const component = new RawATOMain(makeProps({ atos: [] }))
    const panels = component.probeList()

    expect(panels).toHaveLength(0)
  })

  it('renders the add-new section', () => {
    const component = new RawATOMain(makeProps())
    const tree = component.render()
    const list = tree.props.children

    expect(list.type).toBe('ul')
    expect(list.props.children).toHaveLength(2)
  })

  it('handleSubmit normalizes values and calls update (equipment control)', () => {
    const update = jest.fn()
    const component = new RawATOMain(makeProps({ update }))
    component.handleSubmit({
      id: '1', name: 'Top-off', enable: true,
      inlet: 'inlet1', period: '60', debounce: '0',
      control: 'equipment', pump: { id: 'pump1' },
      disable_on_alert: false, one_shot: false,
      notify: false, maxAlert: 10
    })
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({
      control: true,
      is_macro: false,
      period: 60
    }))
  })

  it('handleSubmit normalizes values and calls update (macro control)', () => {
    const update = jest.fn()
    const component = new RawATOMain(makeProps({ update }))
    component.handleSubmit({
      id: '1', name: 'Top-off', enable: true,
      inlet: 'inlet1', period: '30', debounce: '5',
      control: 'macro', pump: { id: 'pump1' },
      disable_on_alert: true, one_shot: true,
      notify: true, maxAlert: 5
    })
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({
      control: true,
      is_macro: true,
      debounce: 5
    }))
  })

  it('handleSubmit with non-control type sets control to false', () => {
    const update = jest.fn()
    const component = new RawATOMain(makeProps({ update }))
    component.handleSubmit({
      id: '1', name: 'Top-off', enable: true,
      inlet: 'inlet1', period: '60', debounce: '',
      control: 'none', pump: {},
      disable_on_alert: false, one_shot: false,
      notify: false, maxAlert: 0
    })
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({
      control: false,
      is_macro: false,
      debounce: 0
    }))
  })

  it('handleDelete calls confirm then delete', async () => {
    const del = jest.fn()
    const component = new RawATOMain(makeProps({ delete: del }))
    component.handleDelete(ato)
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('handleReset calls confirm then reset', async () => {
    const reset = jest.fn()
    const component = new RawATOMain(makeProps({ reset }))
    component.handleReset(ato)
    await Promise.resolve()
    expect(reset).toHaveBeenCalledWith('1')
  })

  it('probeList toggle state calls update with flipped enable', () => {
    const update = jest.fn()
    const component = new RawATOMain(makeProps({ update }))
    const items = component.probeList()
    items[0].props.onToggleState()
    expect(update).toHaveBeenCalledWith('1', expect.objectContaining({ enable: false }))
  })
})
