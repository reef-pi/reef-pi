import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RawConnectors, mapDispatchToProps, mapStateToProps } from './main'
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
import { groupByDriverName } from './driver_groups'
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

  it('<Main /> renders loading state and connector sections', () => {
    const loading = new RawConnectors({ drivers: undefined }).render()
    expect(loading.props.children).toBe('loading')

    const rendered = new RawConnectors({ drivers: stockDrivers }).render()
    const sectionRows = React.Children.toArray(rendered.props.children)
      .filter(child => child.props && String(child.props.className).includes('row'))

    expect(sectionRows.map(row => row.props.className)).toEqual([
      'row inlets',
      'row outlets',
      'row analog-inputs',
      'row jacks'
    ])
  })

  it('<Main /> maps state and fetch dispatch props', () => {
    expect(mapStateToProps({ drivers: stockDrivers })).toEqual({ drivers: stockDrivers })
    const dispatch = jest.fn(action => action)
    mapDispatchToProps(dispatch).fetchDrivers()
    expect(dispatch).toHaveBeenCalledTimes(1)
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

  it('<InletSelector /> getDerivedStateFromProps does not mutate previous state', () => {
    const previousInlet = { id: '1', name: 'foo', pin: 1 }
    const activeInlet = { id: '2', name: 'bar', pin: 2 }
    const previousState = { inlet: previousInlet }
    const nextState = RawInletSelector.getDerivedStateFromProps({
      inlets: [previousInlet, activeInlet],
      active: '2'
    }, previousState)

    expect(previousState.inlet).toBe(previousInlet)
    expect(nextState).not.toBe(previousState)
    expect(nextState.inlet).toBe(activeInlet)
  })

  it('<Inlets />', () => {
    const create = jest.fn()
    const inlets = [
      { id: '1', name: 'foo', pin: 1, reverse: true, driver: 'rpi' },
      { id: '2', name: 'bar', pin: 2, reverse: false, driver: 'rpi' }
    ]
    const component = new RawInlets({
      inlets,
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
    expect(inlets.map(i => i.name)).toEqual(['foo', 'bar'])
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

  it('<Jacks /> handleReverseChange toggles reverse state', () => {
    const component = new RawJacks({
      jacks: [],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    })
    patchSetState(component)
    expect(component.state.JackReverse).toBe(false)
    component.handleReverseChange()
    expect(component.state.JackReverse).toBe(true)
  })

  it('<Jacks /> remove calls confirm then delete', async () => {
    const del = jest.fn()
    const component = new RawJacks({
      jacks: [{ id: '1', name: 'J2', pins: [0], reverse: false, driver: 'rpi' }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create: jest.fn(),
      delete: del,
      update: jest.fn()
    })
    patchSetState(component)
    const removeFn = component.remove({ id: '1', name: 'J2' })
    removeFn()
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('1')
  })

  it('<Jacks /> list groups jacks by driver name', () => {
    const fetch = jest.fn()
    const update = jest.fn()
    const jacks = [
      { id: '1', name: 'J2', pins: [0], reverse: false, driver: 'rpi' },
      { id: '2', name: 'J1', pins: [1], reverse: false, driver: '1' }
    ]
    const component = new RawJacks({
      jacks,
      drivers: stockDrivers,
      fetch,
      create: jest.fn(),
      delete: jest.fn(),
      update
    })
    patchSetState(component)
    const items = component.list()
    expect(items.length).toBeGreaterThan(0)
    const updateFn = items.find(i => i.props && i.props.update)
    if (updateFn) {
      updateFn.props.update({ name: 'J1updated', pins: [0] })
      expect(update).toHaveBeenCalled()
    }
    expect(jacks.map(j => j.name)).toEqual(['J2', 'J1'])
  })

  it('<Jacks /> render does not throw', () => {
    const component = new RawJacks({
      jacks: [{ id: '1', name: 'J1', pins: [0], reverse: false, driver: 'rpi' }],
      drivers: stockDrivers,
      fetch: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    })
    patchSetState(component)
    expect(() => component.render()).not.toThrow()
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
    const outlets = [
      { id: '1', name: 'J2', pin: 1, reverse: true, driver: 'rpi' },
      { id: '2', name: 'J1', pin: 2, reverse: false, driver: 'rpi' }
    ]
    const component = new RawOutlets({
      outlets,
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
    expect(outlets.map(o => o.name)).toEqual(['J2', 'J1'])
  })

  it('<Outlets /> handles driver, pin, reverse, update, and delete flows', async () => {
    const create = jest.fn()
    const update = jest.fn()
    const fetch = jest.fn()
    const del = jest.fn()
    const outlets = [
      { id: '1', name: 'J2', pin: 1, reverse: true, driver: 'rpi' },
      { id: '2', name: 'J1', pin: 2, reverse: false, driver: 'missing' }
    ]
    const component = new RawOutlets({
      outlets,
      drivers: stockDrivers,
      fetch,
      create,
      delete: del,
      update
    })
    patchSetState(component)

    component.handleAdd()
    component.handleNameChange({ target: { value: 'Skimmer' } })
    component.handleDriverChange({ target: { value: 'missing' } })
    expect(component.state.driver).toEqual({})
    component.handleDriverChange({ target: { value: 'rpi' } })
    component.onPinChange(3)
    component.handleReverseChange()
    component.handleSave()

    expect(create).toHaveBeenCalledWith({
      name: 'Skimmer',
      pin: 3,
      reverse: true,
      driver: 'rpi'
    })
    expect(component.state.add).toBe(false)

    const outletNode = component.list().find(item => item.type === Outlet && item.props.outlet_id === '1')
    outletNode.props.update({ name: 'Updated', pin: 4, reverse: false, driver: 'rpi' })
    expect(update).toHaveBeenCalledWith('1', { name: 'Updated', pin: 4, reverse: false, driver: 'rpi' })
    expect(fetch).toHaveBeenCalled()

    component.remove({ id: '2', name: 'J1' })()
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('2')
    expect(outlets.map(o => o.name)).toEqual(['J2', 'J1'])
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

  it('groups connectors by display driver name without mutating input', () => {
    const connectors = [
      { id: '2', name: 'Outlet B', driver: 'missing' },
      { id: '1', name: 'Outlet A', driver: 'rpi' },
      { id: '3', name: 'Outlet C', driver: 'rpi' }
    ]

    const grouped = groupByDriverName(connectors, stockDrivers)

    expect(grouped.driverMap.rpi).toBe(stockDrivers[0])
    expect(grouped.groups.map(group => group.driverName)).toEqual(['Rasoverry Pi', 'missing'])
    expect(grouped.groups[0].connectors.map(connector => connector.name)).toEqual(['Outlet A', 'Outlet C'])
    expect(connectors.map(connector => connector.name)).toEqual(['Outlet B', 'Outlet A', 'Outlet C'])
  })

  it('<Pin /> renders options in numeric order without mutating the pinmap', () => {
    const pins = [10, 2, 1]
    const driver = { id: 'rpi', pinmap: { 'digital-output': pins } }
    const component = new Pin({ driver, update: () => {}, type: 'digital-output', current: 1 })
    const options = component.options()
    const html = renderToStaticMarkup(<Pin driver={driver} update={() => {}} type='digital-output' current={1} />)
    expect(options.map(option => option.props.value)).toEqual([1, 2, 10])
    expect(html).toContain('<select')
    expect((html.match(/<option/g) || []).length).toBe(3)
    expect(pins).toEqual([10, 2, 1])
  })

  it('<Pin /> calls update with parsed numeric value on change', () => {
    const driver = { id: 'rpi', pinmap: { 'digital-output': [1, 2, 3] } }
    const update = jest.fn()
    const m = new Pin({ driver, update, type: 'digital-output', current: 1 })
    m.handleChange({ target: { value: '02' } })
    expect(update).toHaveBeenCalledWith(2)
  })

  it('<Pin /> returns no options without a driver pinmap or matching type', () => {
    expect(new Pin({ driver: undefined, update: () => {}, type: 'digital-output' }).options()).toBeUndefined()
    expect(new Pin({ driver: { id: 'rpi' }, update: () => {}, type: 'digital-output' }).options()).toBeUndefined()
    expect(new Pin({ driver: { id: 'rpi', pinmap: null }, update: () => {}, type: 'digital-output' }).options()).toBeUndefined()
    expect(new Pin({ driver: { id: 'rpi', pinmap: { pwm: [1] } }, update: () => {}, type: 'digital-output' }).options()).toBeUndefined()
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

  it('<AnalogInput /> updates pin and driver while editing', () => {
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
    m.onPinChange(1)
    m.handleSetDriver({ target: { value: 'missing' } })
    expect(m.state.driver).toEqual({})
    m.handleSetDriver({ target: { value: 'rpi' } })
    m.handleEdit()
    expect(update).toHaveBeenCalledWith({ name: 'pH Sensor', pin: 1, driver: 'rpi' })
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
    const analogInputs = [
      { id: '1', name: 'pH', pin: 0, driver: 'ads' },
      { id: '2', name: 'ORP', pin: 1, driver: 'ads' }
    ]
    const component = new RawAnalogInputs({
      analog_inputs: analogInputs,
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
    expect(analogInputs.map(input => input.name)).toEqual(['pH', 'ORP'])
  })

  it('<AnalogInputs /> handles driver changes, updates, and deletes', async () => {
    const fetch = jest.fn()
    const update = jest.fn()
    const del = jest.fn()
    const analogInputs = [
      { id: '1', name: 'pH', pin: 0, driver: 'ads' },
      { id: '2', name: 'ORP', pin: 1, driver: 'missing' }
    ]
    const aiDrivers = [
      { id: 'ads', name: 'ADS1115', pinmap: { 'analog-input': [0, 1, 2, 3] } },
      { id: 'other', name: 'Other', pinmap: { 'analog-input': [4, 5] } }
    ]
    const component = new RawAnalogInputs({
      analog_inputs: analogInputs,
      drivers: aiDrivers,
      fetch,
      create: jest.fn(),
      delete: del,
      update
    })
    patchSetState(component)

    component.componentDidMount()
    component.handleSetDriver({ target: { value: 'other' } })
    expect(component.state.driver.id).toBe('other')
    component.handleSetDriver({ target: { value: 'missing' } })
    expect(component.state.driver).toEqual({})
    component.onPinChange(3)
    expect(component.state.pin).toBe(3)

    const items = component.list()
    const analogInput = items.find(item => item.type === AnalogInput)
    analogInput.props.update({ name: 'pH updated', pin: 2, driver: 'ads' })
    expect(update).toHaveBeenCalledWith('1', { name: 'pH updated', pin: 2, driver: 'ads' })
    expect(fetch).toHaveBeenCalled()

    component.remove({ id: '2', name: 'ORP' })()
    await Promise.resolve()
    expect(del).toHaveBeenCalledWith('2')
    expect(analogInputs.map(input => input.name)).toEqual(['pH', 'ORP'])
  })
})
