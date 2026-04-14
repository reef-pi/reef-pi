import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ConnectorsView } from './main'
import { InletsView } from './inlets'
import Inlet from './inlet'
import Outlet from './outlet'
import { InletSelectorView } from './inlet_selector'
import { JacksView } from './jacks'
import Jack from './jack'
import { OutletsView } from './outlets'
import Pin from './pin'
import AnalogInput from './analog_input'
import { AnalogInputsView } from './analog_inputs'
import { byCapability } from './driver_filter'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

const stockDrivers = [
  { id: 'rpi', name: 'Rasoverry Pi', pinmap: { 'digital-output': [1, 2, 3, 4, 5], 'digital-input': [1, 2, 3], pwm: [1, 2], 'analog-input': [0, 1] } },
  { id: '1', name: 'PCA9685', pinmap: { 'digital-output': [0, 1, 2, 3, 4], pwm: [0, 1, 2, 3] } }
]

jest.mock('utils/confirm', () => ({
  confirm: jest.fn().mockResolvedValue(true)
}))

describe('Connectors', () => {
  it('<ConnectorsView /> renders loading without drivers', () => {
    const html = renderToStaticMarkup(<ConnectorsView drivers={[]} />)
    expect(html).toContain('loading')
  })

  it('<ConnectorsView /> renders sections with drivers', () => {
    const view = new ConnectorsView({ drivers: stockDrivers })
    const tree = view.render()
    const sectionClasses = tree.props.children
      .filter(child => child && child.props && child.props.className)
      .map(child => child.props.className)
    expect(sectionClasses).toContain('row inlets')
    expect(sectionClasses).toContain('row outlets')
    expect(sectionClasses).toContain('row analog-inputs')
    expect(sectionClasses).toContain('row jacks')
  })

  it('<InletSelectorView /> updates selected inlet', () => {
    const update = jest.fn()
    const selector = new InletSelectorView({
      inlets: [{ id: '1', name: 'foo', pin: 1 }, { id: '2', name: 'bar', pin: 2 }],
      active: '1',
      update,
      fetchInlets: jest.fn(),
      name: 'test'
    })
    selector.setState = jest.fn((next) => {
      selector.state = { ...selector.state, ...next }
    })
    selector.componentDidMount()
    expect(selector.props.fetchInlets).toHaveBeenCalled()
    selector.set(1)()
    expect(update).toHaveBeenCalledWith('2')
    expect(selector.state.inlet.id).toBe('2')
  })

  it('<InletsView /> toggles add and creates inlet payload', () => {
    const create = jest.fn()
    const view = new InletsView({
      inlets: [{ id: '1', name: 'foo', pin: 1, reverse: true }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    view.setState = jest.fn((next) => {
      view.state = { ...view.state, ...next }
    })
    view.componentDidMount()
    expect(view.props.fetch).toHaveBeenCalled()
    view.handleAdd()
    expect(view.state.add).toBe(true)
    view.handleNameChange({ target: { value: 'new inlet' } })
    view.handleDriverChange({ target: { value: 'rpi' } })
    view.handleReverseChange()
    view.onPinChange(2)
    view.handleSave()
    expect(create).toHaveBeenCalledWith({
      name: 'new inlet',
      pin: 2,
      reverse: true,
      driver: 'rpi'
    })
  })

  it('<Inlet /> edits and saves', () => {
    const update = jest.fn()
    const inlet = new Inlet({
      inlet_id: '1',
      name: 'foo',
      pin: 1,
      reverse: false,
      update,
      remove: jest.fn(),
      equipment: '',
      drivers: stockDrivers,
      driver: stockDrivers[0]
    })
    inlet.setState = jest.fn((next) => {
      inlet.state = { ...inlet.state, ...next }
    })
    inlet.handleEdit()
    inlet.handleNameChange({ target: { value: 'reef inlet' } })
    inlet.handleDriverChange({ target: { value: 'rpi' } })
    inlet.handleReverseChange()
    inlet.onPinChange(3)
    inlet.handleEdit()
    expect(update).toHaveBeenCalledWith({
      name: 'reef inlet',
      pin: 3,
      reverse: true,
      equipment: '',
      driver: 'rpi'
    })
  })

  it('<JacksView /> validates jack pins before create', () => {
    jest.spyOn(Alert, 'showError')
    const create = jest.fn()
    const view = new JacksView({
      jacks: [{ id: '1', name: 'J2', pins: [0, 2], reverse: false }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    view.setState = jest.fn((next) => {
      view.state = { ...view.state, ...next }
    })
    view.handleAdd()
    view.handleNameChange({ target: { value: 'jack-a' } })
    view.handlePinChange({ target: { value: '4,L' } })
    view.handleSave()
    expect(Alert.showError).toHaveBeenCalled()
    view.handlePinChange({ target: { value: '4,5' } })
    view.handleSave()
    expect(create).toHaveBeenCalledWith({
      name: 'jack-a',
      pins: [4, 5],
      driver: 'rpi',
      reverse: false
    })
    Alert.showError.mockRestore()
  })

  it('<Jack /> edits and saves valid pins', () => {
    const update = jest.fn()
    const jack = new Jack({
      jack_id: '1',
      name: 'foo',
      pins: [1, 2],
      update,
      remove: jest.fn(),
      driver: 'rpi',
      drivers: stockDrivers,
      reverse: false
    })
    jack.setState = jest.fn((next) => {
      jack.state = { ...jack.state, ...next }
    })
    jack.handleEdit()
    jack.handleNameChange({ target: { value: 'bar' } })
    jack.handleSetDriver({ target: { value: '1' } })
    jack.handlePinChange({ target: { value: '4,5' } })
    jack.handleReverseChange()
    jack.handleEdit()
    expect(update).toHaveBeenCalledWith({
      name: 'bar',
      pins: [4, 5],
      driver: '1',
      reverse: true
    })
  })

  it('<OutletsView /> toggles add and creates outlet payload', () => {
    const create = jest.fn()
    const view = new OutletsView({
      outlets: [{ id: '1', name: 'J2', pin: 1, reverse: true }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    view.setState = jest.fn((next) => {
      view.state = { ...view.state, ...next }
    })
    view.handleAdd()
    view.handleNameChange({ target: { value: 'heater' } })
    view.handleDriverChange({ target: { value: '1' } })
    view.handleReverseChange()
    view.onPinChange(2)
    view.handleSave()
    expect(create).toHaveBeenCalledWith({
      name: 'heater',
      pin: 2,
      reverse: true,
      driver: '1'
    })
  })

  it('<Outlet /> edits and saves', () => {
    const update = jest.fn()
    const outlet = new Outlet({
      name: 'foo',
      reverse: true,
      pin: 1,
      outlet_id: '1',
      update,
      remove: jest.fn(),
      equipment: '',
      driver: stockDrivers[0],
      drivers: stockDrivers
    })
    outlet.setState = jest.fn((next) => {
      outlet.state = { ...outlet.state, ...next }
    })
    outlet.handleEdit()
    outlet.handleNameChange({ target: { value: 'return pump' } })
    outlet.handleDriverChange({ target: { value: '1' } })
    outlet.handleReverseChange()
    outlet.onPinChange(4)
    outlet.handleEdit()
    expect(update).toHaveBeenCalledWith({
      name: 'return pump',
      pin: 4,
      reverse: false,
      equipment: '',
      driver: '1'
    })
  })

  it('byCapability returns expected matches', () => {
    const driver = { id: '1', pinmap: { 'analog-input': [0, 1, 2], 'digital-output': [3, 4] } }
    expect(byCapability('analog-input')(driver)).toBe(true)
    expect(byCapability('digital-output')(driver)).toBe(true)
    expect(byCapability('pwm')(driver)).toBe(false)
    expect(byCapability('analog-input')({ id: '2' })).toBe(false)
  })

  it('<Pin /> renders options and updates', () => {
    const driver = { id: 'rpi', pinmap: { 'digital-output': [3, 1, 2] } }
    const update = jest.fn()
    const html = renderToStaticMarkup(<Pin driver={driver} update={update} type='digital-output' current={1} />)
    expect(html).toContain('<option value="1"')
    expect(html).toContain('<option value="2"')
    expect(html).toContain('<option value="3"')
    const pin = new Pin({ driver, update, type: 'digital-output', current: 1 })
    pin.handleChange({ target: { value: '2' } })
    expect(update).toHaveBeenCalledWith(2)
  })

  it('<Pin /> renders empty for undefined driver', () => {
    const html = renderToStaticMarkup(<Pin driver={undefined} update={() => {}} type='digital-output' />)
    expect(html).not.toContain('<option')
  })

  it('<AnalogInput /> toggles to edit, saves, and removes', () => {
    const update = jest.fn()
    const remove = jest.fn()
    const input = new AnalogInput({
      name: 'pH Sensor',
      pin: 0,
      analog_input_id: '1',
      driver: stockDrivers[0],
      drivers: stockDrivers,
      update,
      remove
    })
    input.setState = jest.fn((next) => {
      input.state = { ...input.state, ...next }
    })
    input.handleEdit()
    input.handleNameChange({ target: { value: 'New Name' } })
    input.handleSetDriver({ target: { value: 'rpi' } })
    input.onPinChange(1)
    input.handleEdit()
    expect(update).toHaveBeenCalledWith({
      name: 'New Name',
      pin: 1,
      driver: 'rpi'
    })
    input.handleRemove()
    expect(remove).toHaveBeenCalled()
  })

  it('<AnalogInputsView /> renders and adds analog input', () => {
    const aiDrivers = [
      { id: 'ads', name: 'ADS1115', pinmap: { 'analog-input': [0, 1, 2, 3] } }
    ]
    const create = jest.fn()
    const view = new AnalogInputsView({
      analog_inputs: [{ id: '1', name: 'pH', pin: 0, driver: 'ads' }],
      drivers: aiDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    view.setState = jest.fn((next) => {
      view.state = { ...view.state, ...next }
    })
    view.componentDidMount()
    expect(view.props.fetch).toHaveBeenCalled()
    view.handleAdd()
    view.handleNameChange({ target: { value: 'New Sensor' } })
    view.onPinChange(1)
    view.handleSave()
    expect(create).toHaveBeenCalledWith({
      name: 'New Sensor',
      pin: 1,
      driver: 'ads'
    })
  })
})
