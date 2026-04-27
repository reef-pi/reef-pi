import React from 'react'
import Main, { RawConnectorsMain } from './main'
import Inlets, { RawInlets } from './inlets'
import Inlet from './inlet'
import Outlet from './outlet'
import InletSelector, { RawInletSelector } from './inlet_selector'
import Jacks, { RawJacks } from './jacks'
import Jack from './jack'
import Outlets, { RawOutlets } from './outlets'
import Pin from './pin'
import AnalogInput from './analog_input'
import AnalogInputs, { RawAnalogInputs } from './analog_inputs'
import { byCapability } from './driver_filter'
import 'isomorphic-fetch'
const stockDrivers = [
  { id: 'rpi', name: 'Rasoverry Pi', pinmap: { 'digital-output': [1, 2, 3, 4, 5], 'digital-input': [1, 2, 3, 4, 5] } },
  { id: '1', name: 'PCA9685', pinmap: { 'digital-output': [0, 1, 2, 3, 4], pwm: [0, 1, 2, 3] } }
]
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
describe('Connectors', () => {
  it('<Main />', () => {
    const empty = new RawConnectorsMain({ drivers: [] })
    expect(empty.render().props.className).toBe('container')
    const main = new RawConnectorsMain({ drivers: stockDrivers })
    expect(main.render().props.className).toBe('container')
    expect(Main).toBeDefined()
  })

  it('<InletSelector />', () => {
    const update = jest.fn()
    const selector = new RawInletSelector({
      inlets: [{ id: '1', name: 'foo', pin: 1 }, { id: '2', name: 'bar', pin: 2 }],
      drivers: stockDrivers,
      active: '1',
      update,
      fetchInlets: jest.fn(),
      name: 'sel'
    })
    selector.setState = nextState => { selector.state = { ...selector.state, ...nextState } }
    selector.set(0)()
    expect(update).toHaveBeenCalledWith('1')
    expect(selector.inlets().props.className).toBe('dropdown')
    expect(InletSelector).toBeDefined()
  })

  it('<Inlets />', () => {
    const create = jest.fn()
    const inlets = new RawInlets({
      inlets: [{ id: '1', name: 'foo', pin: 1, reverse: true }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    inlets.setState = nextState => { inlets.state = { ...inlets.state, ...nextState } }
    inlets.handleAdd()
    inlets.handleNameChange({ target: { value: 'foo' } })
    inlets.handleDriverChange({ target: { value: 'rpi' } })
    inlets.handleReverseChange()
    inlets.onPinChange(2)
    inlets.handleSave()
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: 'foo', pin: 2 }))
    expect(inlets.list().some(item => item.type === Inlet)).toBe(true)
    expect(Inlets).toBeDefined()
  })

  it('<Inlet />', () => {
    const update = jest.fn()
    const inlet = new Inlet({
      inlet_id: '1',
      name: 'foo',
      pin: 1,
      reverse: false,
      equipment: '',
      update,
      remove: jest.fn(),
      drivers: stockDrivers,
      driver: stockDrivers[0]
    })
    inlet.setState = nextState => { inlet.state = { ...inlet.state, ...nextState } }
    inlet.handleEdit()
    inlet.handleNameChange({ target: { value: 'foo' } })
    inlet.handleDriverChange({ target: { value: 'rpi' } })
    inlet.handleReverseChange()
    inlet.onPinChange(2)
    inlet.handleEdit()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ name: 'foo', pin: 2 }))
  })

  it('<Jacks />', () => {
    const create = jest.fn()
    const jacks = new RawJacks({
      jacks: [{ id: '1', name: 'J2', pins: [0, 2], reverse: false }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    jacks.setState = nextState => { jacks.state = { ...jacks.state, ...nextState } }
    jacks.handleAdd()
    jacks.handleNameChange({ target: { value: 'foo' } })
    jacks.handlePinChange({ target: { value: '4' } })
    jacks.handleSetDriver({ target: { value: '1' } })
    jacks.handleSave()
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: 'foo', pins: [4], driver: '1' }))
    expect(jacks.list().some(item => item.type === Jack)).toBe(true)
    expect(Jacks).toBeDefined()
  })

  it('<Jack />', () => {
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
    jack.setState = nextState => { jack.state = { ...jack.state, ...nextState } }
    jack.handleEdit()
    jack.handleNameChange({ target: { value: 'foo' } })
    jack.handlePinChange({ target: { value: '4' } })
    jack.handleSetDriver({ target: { value: '1' } })
    jack.handleEdit()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ name: 'foo', pins: [4], driver: '1' }))
  })
  it('<Outlets />', () => {
    const create = jest.fn()
    const outlets = new RawOutlets({
      outlets: [{ id: '1', name: 'J2', pin: 1, reverse: true }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    outlets.setState = nextState => { outlets.state = { ...outlets.state, ...nextState } }
    outlets.handleAdd()
    outlets.handleNameChange({ target: { value: 'foo' } })
    outlets.handleDriverChange({ target: { value: '1' } })
    outlets.handleReverseChange()
    outlets.onPinChange(3)
    outlets.handleSave()
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: 'foo', pin: 3, driver: '1' }))
    expect(outlets.list().some(item => item.type === Outlet)).toBe(true)
    expect(Outlets).toBeDefined()
  })
  it('<Outlet />', () => {
    const update = jest.fn()
    const outlet = new Outlet({
      name: 'foo',
      reverse: true,
      pin: 1,
      outlet_id: '1',
      equipment: '',
      update,
      remove: jest.fn(),
      driver: stockDrivers[0],
      drivers: stockDrivers
    })
    outlet.setState = nextState => { outlet.state = { ...outlet.state, ...nextState } }
    outlet.handleEdit()
    outlet.handleNameChange({ target: { value: 'foo' } })
    outlet.handleDriverChange({ target: { value: '1' } })
    outlet.handleReverseChange()
    outlet.onPinChange(2)
    outlet.handleEdit()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ name: 'foo', pin: 2, driver: '1' }))
  })

  it('byCapability returns true for matching capability', () => {
    const driver = { id: '1', pinmap: { 'analog-input': [0, 1, 2], 'digital-output': [3, 4] } }
    expect(byCapability('analog-input')(driver)).toBe(true)
    expect(byCapability('digital-output')(driver)).toBe(true)
    expect(byCapability('pwm')(driver)).toBe(false)
  })

  it('byCapability returns false for driver without pinmap', () => {
    const driver = { id: '1' }
    expect(byCapability('analog-input')(driver)).toBe(false)
  })

  it('<Pin /> renders select with options for driver pins', () => {
    const driver = { id: 'rpi', pinmap: { 'digital-output': [1, 2, 3] } }
    const pin = new Pin({ driver, update: () => {}, type: 'digital-output', current: 1 })
    const rendered = pin.render()
    expect(rendered.type).toBe('div')
    expect(pin.options()).toHaveLength(3)
  })

  it('<Pin /> calls update on change', () => {
    const driver = { id: 'rpi', pinmap: { 'digital-output': [1, 2, 3] } }
    const update = jest.fn()
    const pin = new Pin({ driver, update, type: 'digital-output', current: 1 })
    pin.handleChange({ target: { value: '2' } })
    expect(update).toHaveBeenCalledWith(2)
  })

  it('<Pin /> renders empty for undefined driver', () => {
    const pin = new Pin({ driver: undefined, update: () => {}, type: 'digital-output' })
    expect(pin.options()).toBeUndefined()
  })

  it('<AnalogInput /> renders view mode by default', () => {
    const analogInput = new AnalogInput({
      name: 'pH Sensor',
      pin: 0,
      analog_input_id: '1',
      driver: stockDrivers[0],
      drivers: stockDrivers,
      update: () => {},
      remove: () => {}
    })
    expect(analogInput.render().type).toBe('div')
  })

  it('<AnalogInput /> toggles to edit and saves', () => {
    const update = jest.fn()
    const analogInput = new AnalogInput({
      name: 'pH Sensor',
      pin: 0,
      analog_input_id: '1',
      driver: stockDrivers[0],
      drivers: stockDrivers,
      update,
      remove: () => {}
    })
    analogInput.setState = nextState => { analogInput.state = { ...analogInput.state, ...nextState } }
    analogInput.handleEdit()
    expect(analogInput.state.edit).toBe(true)
    analogInput.handleNameChange({ target: { value: 'New Name' } })
    expect(analogInput.state.name).toBe('New Name')
    analogInput.handleEdit()
    expect(update).toHaveBeenCalled()
    expect(analogInput.state.edit).toBe(false)
  })

  it('<AnalogInput /> handleRemove calls remove', () => {
    const remove = jest.fn()
    const analogInput = new AnalogInput({
      name: 'Test',
      pin: 0,
      analog_input_id: '1',
      driver: stockDrivers[0],
      drivers: stockDrivers,
      update: () => {},
      remove
    })
    analogInput.handleRemove()
    expect(remove).toHaveBeenCalled()
  })

  it('<AnalogInputs /> renders and adds analog input', () => {
    const aiDrivers = [
      { id: 'ads', name: 'ADS1115', pinmap: { 'analog-input': [0, 1, 2, 3] } }
    ]
    const create = jest.fn()
    const analogInputs = new RawAnalogInputs({
      analog_inputs: [{ id: '1', name: 'pH', pin: 0, driver: 'ads' }],
      drivers: aiDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    analogInputs.setState = nextState => { analogInputs.state = { ...analogInputs.state, ...nextState } }
    analogInputs.handleAdd()
    analogInputs.handleNameChange({ target: { value: 'New Sensor' } })
    analogInputs.handleSave()
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Sensor', driver: 'ads' }))
    expect(analogInputs.list().some(item => item.type === AnalogInput)).toBe(true)
    expect(AnalogInputs).toBeDefined()
  })
})
