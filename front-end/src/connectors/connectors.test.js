import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { RawConnectors, mapDispatchToProps, mapStateToProps } from './main'
import { RawInletSelector } from './inlet_selector'
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
  it('<Main /> maps state and fetch dispatch props', () => {
    expect(mapStateToProps({
      drivers: stockDrivers,
      outlets: [],
      inlets: [],
      jacks: [],
      analog_inputs: []
    })).toEqual({
      drivers: stockDrivers,
      outlets: [],
      inlets: [],
      jacks: [],
      analog_inputs: []
    })
    const dispatch = jest.fn(action => action)
    mapDispatchToProps(dispatch).fetchDrivers()
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('<Main /> renders connector groups', () => {
    const component = new RawConnectors({
      drivers: stockDrivers,
      outlets: [
        { id: 'out-1', name: 'Return Pump', pin: 0, driver: '1', equipment: 'eq-1' },
        { id: 'out-2', name: 'Skimmer', pin: 1, driver: '1' }
      ],
      jacks: [
        { id: 'jack-auto-0', name: 'PCA9685-0', pins: [0], driver: '1' },
        { id: 'jack-0', name: 'J0', pins: [0], driver: '1' },
        { id: 'jack-1', name: 'J1', pins: [0, 1], driver: '1' },
        { id: 'jack-2', name: 'Moon', pins: [2], driver: '1' }
      ],
      inlets: [{ id: 'in-1', name: 'Float', pin: 1, driver: 'rpi' }],
      analog_inputs: [
        { id: 'ai-1', name: 'pH', pin: 0, driver: 'rpi' },
        { id: 'ai-2', name: 'ORP', pin: 0, driver: 'rpi' }
      ],
      fetchDrivers: jest.fn(),
      fetchOutlets: jest.fn(),
      fetchInlets: jest.fn(),
      fetchJacks: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      deleteOutlet: jest.fn(),
      deleteInlet: jest.fn(),
      deleteJack: jest.fn(),
      deleteAnalogInput: jest.fn(),
      updateOutlet: jest.fn(),
      updateInlet: jest.fn(),
      updateJack: jest.fn(),
      updateAnalogInput: jest.fn()
    })
    patchSetState(component)
    const html = renderToStaticMarkup(component.render())

    expect(html).toContain('connectors-shell')
    expect(html).toContain('Rasoverry Pi')
    expect(html).toContain('PCA9685')
    expect(html).toContain('6 / 9 used')
    expect(html).toContain('connector-channel-grid')
    expect(html).toContain('Moon')
    expect(html).toContain('J0')
    expect(html).toContain('J1')
    expect((html.match(/connector-channel-cell/g) || []).length).toBe(9)
    expect(html).toContain('connector-conflict')
  })

  it('<Main /> filters, persists group state, and batch deletes selected channels', async () => {
    const setItem = jest.fn()
    const getItem = jest.fn(() => 'false')
    Object.defineProperty(window, 'localStorage', {
      value: { getItem, setItem },
      configurable: true
    })
    const deleteOutlet = jest.fn()
    const deleteJack = jest.fn()
    const updateOutlet = jest.fn()
    const updateJack = jest.fn()
    const component = new RawConnectors({
      drivers: stockDrivers,
      outlets: [{ id: 'out-1', name: 'Return Pump', pin: 0, driver: '1', equipment: 'eq-1' }],
      jacks: [{ id: 'jack-1', name: 'Moon', pins: [2], driver: '1' }],
      inlets: [],
      analog_inputs: [],
      fetchDrivers: jest.fn(),
      fetchOutlets: jest.fn(),
      fetchInlets: jest.fn(),
      fetchJacks: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      deleteOutlet,
      deleteInlet: jest.fn(),
      deleteJack,
      deleteAnalogInput: jest.fn(),
      updateOutlet,
      updateInlet: jest.fn(),
      updateJack,
      updateAnalogInput: jest.fn()
    })
    patchSetState(component)

    expect(component.state.openGroups.PCA9685).toBe(false)
    component.toggleGroup('PCA9685')
    expect(setItem).toHaveBeenCalledWith('reefpi.connectors.PCA9685.open', 'true')

    component.handleFilterChange({ target: { value: 'moon' } })
    expect(renderToStaticMarkup(component.render())).toContain('Moon')
    expect(renderToStaticMarkup(component.render())).not.toContain('Return Pump')

    component.toggleSelection({ id: 'out-1', kind: 'outlet', name: 'Return Pump', pin: 0, driver: '1', equipment: 'eq-1' })
    component.toggleSelection({ id: 'jack-1', kind: 'jack', name: 'Moon', pins: [2], driver: '1' })
    component.handleBatchDriverChange({ target: { value: 'rpi' } })
    component.handleBatchMove()
    expect(updateOutlet).toHaveBeenCalledWith('out-1', { name: 'Return Pump', driver: 'rpi', pin: 0, equipment: 'eq-1' })
    expect(updateJack).toHaveBeenCalledWith('jack-1', { name: 'Moon', driver: 'rpi', pins: [2] })

    component.toggleSelection({ id: 'out-1', kind: 'outlet', name: 'Return Pump' })
    component.toggleSelection({ id: 'jack-1', kind: 'jack', name: 'Moon' })
    component.handleBatchDelete()
    await Promise.resolve()
    expect(deleteOutlet).toHaveBeenCalledWith('out-1')
    expect(deleteJack).toHaveBeenCalledWith('jack-1')
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

  describe('create and edit flows', () => {
    const baseProps = () => ({
      drivers: [
        ...stockDrivers,
        { id: 'ph', name: 'ph', pinmap: { 'analog-input': [0] } }
      ],
      outlets: [{ id: 'out-1', name: 'Return Pump', pin: 1, driver: 'rpi', reverse: true, equipment: 'eq-1' }],
      inlets: [],
      jacks: [],
      analog_inputs: [],
      fetchDrivers: jest.fn(),
      fetchOutlets: jest.fn(),
      fetchInlets: jest.fn(),
      fetchJacks: jest.fn(),
      fetchAnalogInputs: jest.fn(),
      createOutlet: jest.fn(),
      createInlet: jest.fn(),
      createJack: jest.fn(),
      createAnalogInput: jest.fn(),
      updateOutlet: jest.fn(),
      updateInlet: jest.fn(),
      updateJack: jest.fn(),
      updateAnalogInput: jest.fn(),
      deleteOutlet: jest.fn(),
      deleteInlet: jest.fn(),
      deleteJack: jest.fn(),
      deleteAnalogInput: jest.fn()
    })
    const tid = id => screen.getByTestId(id)

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: () => null, setItem: jest.fn() },
        configurable: true
      })
    })

    it('shows validation errors and does not create when the form is empty', () => {
      const props = baseProps()
      render(<RawConnectors {...props} />)
      fireEvent.click(tid('smoke-connector-add'))
      fireEvent.click(tid('smoke-connector-submit'))
      expect(screen.getByText('Name cannot be empty')).toBeTruthy()
      expect(props.createOutlet).not.toHaveBeenCalled()
    })

    it('creates an outlet from the top-level add button', () => {
      const props = baseProps()
      render(<RawConnectors {...props} />)
      fireEvent.click(tid('smoke-connector-add'))
      fireEvent.change(tid('smoke-connector-name'), { target: { value: 'O1' } })
      fireEvent.change(tid('smoke-connector-pin'), { target: { value: '3' } })
      fireEvent.click(tid('smoke-connector-reverse'))
      fireEvent.click(tid('smoke-connector-submit'))
      expect(props.createOutlet).toHaveBeenCalledWith({ name: 'O1', pin: 3, reverse: true, driver: 'rpi' })
      expect(screen.queryByTestId('smoke-connector-form')).toBeNull()
    })

    it('creates an inlet, analog input and jack with the right payloads', () => {
      const props = baseProps()
      render(<RawConnectors {...props} />)

      fireEvent.click(tid('smoke-connector-add'))
      fireEvent.change(tid('smoke-connector-kind'), { target: { value: 'inlet' } })
      fireEvent.change(tid('smoke-connector-name'), { target: { value: 'I1' } })
      fireEvent.change(tid('smoke-connector-pin'), { target: { value: '2' } })
      fireEvent.click(tid('smoke-connector-submit'))
      expect(props.createInlet).toHaveBeenCalledWith({ name: 'I1', pin: 2, reverse: false, driver: 'rpi' })

      fireEvent.click(tid('smoke-connector-add'))
      fireEvent.change(tid('smoke-connector-kind'), { target: { value: 'analog' } })
      fireEvent.change(tid('smoke-connector-name'), { target: { value: 'AI1' } })
      fireEvent.change(tid('smoke-connector-driver'), { target: { value: 'ph' } })
      fireEvent.click(tid('smoke-connector-submit'))
      expect(props.createAnalogInput).toHaveBeenCalledWith({ name: 'AI1', pin: 0, driver: 'ph' })

      fireEvent.click(tid('smoke-connector-add'))
      fireEvent.change(tid('smoke-connector-kind'), { target: { value: 'jack' } })
      fireEvent.change(tid('smoke-connector-name'), { target: { value: 'J0' } })
      fireEvent.change(tid('smoke-connector-pins'), { target: { value: '0, 1' } })
      fireEvent.click(tid('smoke-connector-submit'))
      expect(props.createJack).toHaveBeenCalledWith({ name: 'J0', pins: [0, 1], reverse: false, driver: '1' })
    })

    it('rejects non numeric jack pins', () => {
      const props = baseProps()
      render(<RawConnectors {...props} />)
      fireEvent.click(tid('smoke-connector-add'))
      fireEvent.change(tid('smoke-connector-kind'), { target: { value: 'jack' } })
      fireEvent.change(tid('smoke-connector-name'), { target: { value: 'J0' } })
      fireEvent.change(tid('smoke-connector-pins'), { target: { value: 'a,b' } })
      fireEvent.click(tid('smoke-connector-submit'))
      expect(props.createJack).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toBeTruthy()
    })

    it('group add button preselects that driver', () => {
      const props = baseProps()
      render(<RawConnectors {...props} />)
      fireEvent.click(tid('smoke-connector-add-Rasoverry Pi'))
      expect(tid('smoke-connector-driver').value).toBe('rpi')
      expect(tid('smoke-connector-kind').value).toBe('outlet')
      fireEvent.click(tid('smoke-connector-cancel'))
      expect(screen.queryByTestId('smoke-connector-form')).toBeNull()
    })

    it('edits the selected connector and keeps its equipment link', () => {
      const props = baseProps()
      render(<RawConnectors {...props} />)
      expect(tid('smoke-connector-edit').disabled).toBe(true)
      fireEvent.click(tid('smoke-connector-row-Return Pump'))
      fireEvent.click(tid('smoke-connector-edit'))
      expect(tid('smoke-connector-kind').disabled).toBe(true)
      expect(tid('smoke-connector-name').value).toBe('Return Pump')
      fireEvent.change(tid('smoke-connector-name'), { target: { value: 'Return' } })
      fireEvent.click(tid('smoke-connector-submit'))
      expect(props.updateOutlet).toHaveBeenCalledWith('out-1', {
        name: 'Return', pin: 1, reverse: true, driver: 'rpi', equipment: 'eq-1'
      })
    })

    it('clicking an available PCA9685 grid cell opens create with the pin prefilled', () => {
      const props = baseProps()
      const pca = { id: 'pca', name: 'PCA9685x', pinmap: { 'digital-output': [], pwm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] } }
      props.drivers = [pca]
      props.jacks = [{ id: 'j-1', name: 'Moon', pins: [0], driver: 'pca' }]
      render(<RawConnectors {...props} />)
      fireEvent.click(tid('smoke-connector-cell-available-jack-4'))
      expect(tid('smoke-connector-kind').value).toBe('jack')
      expect(tid('smoke-connector-driver').value).toBe('pca')
      expect(within(tid('smoke-connector-form')).getByDisplayValue('Jack')).toBeTruthy()
    })
  })
})
