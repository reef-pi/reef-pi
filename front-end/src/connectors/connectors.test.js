import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RawConnectors } from './main'
import { RawInlets } from './inlets'
import Inlet from './inlet'
import Outlet from './outlet'
import { RawInletSelector } from './inlet_selector'
import { RawJacks } from './jacks'
import Jack from './jack'
import { RawOutlets } from './outlets'
import Pin from './pin'
import AnalogInput from './analog_input'
import { RawAnalogInputs } from './analog_inputs'
import { byCapability } from './driver_filter'
import 'isomorphic-fetch'

const stockDrivers = [
  { id: 'rpi', name: 'Rasoverry Pi', pinmap: { 'digital-output': [1, 2, 3, 4, 5], 'digital-input': [1, 2, 3], 'analog-input': [0, 1] } },
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

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showUpdateSuccessful: jest.fn()
}))

const patchSetState = component => {
  component.setState = update => {
    component.state = {
      ...component.state,
      ...(typeof update === 'function' ? update(component.state) : update)
    }
  }
}

describe('Connectors', () => {
  it('<Main />', () => {
    expect(new RawConnectors({ drivers: [] }).render().props.className).toBe('container')
    expect(new RawConnectors({ drivers: stockDrivers }).render().props.className).toBe('container')
  })

  it('<InletSelector />', () => {
    const update = jest.fn()
    const component = new RawInletSelector({
      inlets: [{ id: '1', name: 'foo', pin: 1 }, { id: '2', name: 'bar', pin: 2 }],
      active: '1',
      update,
      fetchInlets: jest.fn(),
      name: 'test'
    })
    patchSetState(component)
    component.componentDidMount()
    component.set(0)()
    expect(update).toHaveBeenCalledWith('1')
    expect(renderToStaticMarkup(component.inlets())).toContain('foo')
  })

  it('<Inlets />', () => {
    const create = jest.fn()
    const component = new RawInlets({
      inlets: [{ id: '1', name: 'foo', pin: 1, reverse: true, driver: 'rpi' }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    patchSetState(component)
    component.componentDidMount()
    component.handleAdd()
    component.handleNameChange({ target: { value: 'foo' } })
    component.handleDriverChange({ target: { value: 'rpi' } })
    component.handleReverseChange()
    component.handleSave()
    expect(create).toHaveBeenCalled()
    expect(component.list().length).toBeGreaterThan(0)
  })

  it('<Inlet />', () => {
    const update = jest.fn()
    const remove = jest.fn()
    const m = new Inlet({
      inlet_id: '1',
      name: 'foo',
      pin: 1,
      reverse: false,
      update,
      remove,
      drivers: stockDrivers,
      driver: stockDrivers[0]
    })
    patchSetState(m)
    m.handleEdit()
    m.handleNameChange({ target: { value: 'foo' } })
    m.handleDriverChange({ target: { value: 'rpi' } })
    m.handleReverseChange()
    m.handleEdit()
    expect(update).toHaveBeenCalled()
  })

  it('<Jacks />', () => {
    const create = jest.fn()
    const component = new RawJacks({
      jacks: [{ id: '1', name: 'J2', pins: [0, 2], reverse: false, driver: '1' }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    patchSetState(component)
    component.componentDidMount()
    component.handleAdd()
    component.handleNameChange({ target: { value: 'foo' } })
    component.handlePinChange({ target: { value: '4,L' } })
    component.handleSetDriver({ target: { value: '1' } })
    component.handleSave()
    expect(create).not.toHaveBeenCalled()
    component.handlePinChange({ target: { value: '4' } })
    component.handleSave()
    expect(create).toHaveBeenCalled()
  })

  it('<Jack />', () => {
    const update = jest.fn()
    const m = new Jack({
      jack_id: '1',
      name: 'foo',
      pins: [1, 2],
      update,
      remove: () => true,
      driver: 'rpi',
      drivers: stockDrivers,
      reverse: false
    })
    patchSetState(m)
    m.handleEdit()
    m.handleNameChange({ target: { value: 'foo' } })
    m.handlePinChange({ target: { value: '4,L' } })
    m.handleEdit()
    expect(update).not.toHaveBeenCalled()
    m.handleSetDriver({ target: { value: '1' } })
    m.handlePinChange({ target: { value: '4' } })
    m.handleEdit()
    expect(update).toHaveBeenCalled()
  })

  it('<Outlets />', () => {
    const create = jest.fn()
    const component = new RawOutlets({
      outlets: [{ id: '1', name: 'J2', pin: 1, reverse: true, driver: 'rpi' }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    patchSetState(component)
    component.componentDidMount()
    component.handleAdd()
    component.handleNameChange({ target: { value: 'foo' } })
    component.handleDriverChange({ target: { value: '1' } })
    component.handleReverseChange()
    component.handleSave()
    expect(create).toHaveBeenCalled()
    expect(component.list().length).toBeGreaterThan(0)
  })

  it('<Outlet />', () => {
    const update = jest.fn()
    const m = new Outlet({
      name: 'foo',
      reverse: true,
      pin: 1,
      outlet_id: '1',
      update,
      remove: () => true,
      driver: stockDrivers[0],
      drivers: stockDrivers
    })
    patchSetState(m)
    m.handleEdit()
    m.handleNameChange({ target: { value: 'foo' } })
    m.handleDriverChange({ target: { value: '1' } })
    m.handleReverseChange()
    m.handleEdit()
    expect(update).toHaveBeenCalled()
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
    const html = renderToStaticMarkup(<Pin driver={driver} update={() => {}} type='digital-output' current={1} />)
    expect(html).toContain('<select')
    expect((html.match(/<option/g) || []).length).toBe(3)
  })

  it('<Pin /> calls update on change', () => {
    const driver = { id: 'rpi', pinmap: { 'digital-output': [1, 2, 3] } }
    const update = jest.fn()
    const m = new Pin({ driver, update, type: 'digital-output', current: 1 })
    m.handleChange({ target: { value: '2' } })
    expect(update).toHaveBeenCalledWith(2)
  })

  it('<Pin /> renders empty for undefined driver', () => {
    const m = new Pin({ driver: undefined, update: () => {}, type: 'digital-output' })
    expect(m.options()).toBeUndefined()
  })

  it('<AnalogInput /> renders view mode by default', () => {
    const m = new AnalogInput({
      name: 'pH Sensor',
      pin: 0,
      analog_input_id: '1',
      driver: stockDrivers[0],
      drivers: stockDrivers,
      update: () => {},
      remove: () => {}
    })
    expect(renderToStaticMarkup(m.render())).toContain('analog_input-edit')
  })

  it('<AnalogInput /> toggles to edit and saves', () => {
    const update = jest.fn()
    const m = new AnalogInput({
      name: 'pH Sensor',
      pin: 0,
      analog_input_id: '1',
      driver: stockDrivers[0],
      drivers: stockDrivers,
      update,
      remove: () => {}
    })
    patchSetState(m)
    m.handleEdit()
    expect(m.state.edit).toBe(true)
    m.handleNameChange({ target: { value: 'New Name' } })
    expect(m.state.name).toBe('New Name')
    m.handleEdit()
    expect(update).toHaveBeenCalled()
    expect(m.state.edit).toBe(false)
  })

  it('<AnalogInput /> handleRemove calls remove', () => {
    const remove = jest.fn()
    const m = new AnalogInput({
      name: 'Test',
      pin: 0,
      analog_input_id: '1',
      driver: stockDrivers[0],
      drivers: stockDrivers,
      update: () => {},
      remove
    })
    m.handleRemove()
    expect(remove).toHaveBeenCalled()
  })

  it('<AnalogInputs /> renders and adds analog input', () => {
    const aiDrivers = [
      { id: 'ads', name: 'ADS1115', pinmap: { 'analog-input': [0, 1, 2, 3] } }
    ]
    const create = jest.fn()
    const component = new RawAnalogInputs({
      analog_inputs: [{ id: '1', name: 'pH', pin: 0, driver: 'ads' }],
      drivers: aiDrivers,
      fetch: jest.fn(),
      create,
      delete: jest.fn(),
      update: jest.fn()
    })
    patchSetState(component)
    component.componentDidMount()
    component.handleAdd()
    component.handleNameChange({ target: { value: 'New Sensor' } })
    component.handleSave()
    expect(create).toHaveBeenCalled()
    expect(component.list().length).toBeGreaterThan(0)
  })
})
