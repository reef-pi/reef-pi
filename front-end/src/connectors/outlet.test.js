import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Outlet from './outlet'

const drivers = [
  { id: 'rpi', name: 'Raspberry Pi', pinmap: { 'digital-output': [1, 2, 3] } },
  { id: 'pca', name: 'PCA9685', pinmap: { pwm: [0] } }
]

const patchSetState = component => {
  component.setState = update => {
    component.state = {
      ...component.state,
      ...(typeof update === 'function' ? update(component.state) : update)
    }
  }
}

describe('<Outlet />', () => {
  it('renders view mode with driver, in-use, and reverse labels', () => {
    const outlet = new Outlet({
      outlet_id: '1',
      name: 'Return Pump',
      pin: 2,
      reverse: true,
      equipment: 'pump',
      driver: drivers[0],
      drivers,
      update: jest.fn(),
      remove: jest.fn()
    })

    const html = renderToStaticMarkup(outlet.render())

    expect(html).toContain('Return Pump')
    expect(html).toContain('Raspberry Pi')
    expect(html).toContain('(2)')
    expect(outlet.state.reverse).toBe(true)
    expect(outlet.props.equipment).toBe('pump')
  })

  it('edits name, pin, driver, reverse state, and saves payload', () => {
    const update = jest.fn()
    const outlet = new Outlet({
      outlet_id: '1',
      name: 'Return Pump',
      pin: 2,
      reverse: false,
      equipment: '',
      driver: drivers[0],
      drivers,
      update,
      remove: jest.fn()
    })
    patchSetState(outlet)

    outlet.handleEdit()
    expect(outlet.state.edit).toBe(true)
    expect(renderToStaticMarkup(outlet.render())).toContain('outlet-1-name')

    outlet.handleNameChange({ target: { value: 'Skimmer' } })
    outlet.onPinChange(3)
    outlet.handleDriverChange({ target: { value: 'missing' } })
    expect(outlet.state.driver).toEqual({})
    outlet.handleDriverChange({ target: { value: 'rpi' } })
    outlet.handleReverseChange()
    outlet.handleEdit()

    expect(update).toHaveBeenCalledWith({
      name: 'Skimmer',
      pin: 3,
      reverse: true,
      equipment: '',
      driver: 'rpi'
    })
    expect(outlet.state).toEqual(expect.objectContaining({
      edit: false,
      name: 'Skimmer',
      pin: 3,
      reverse: true
    }))
  })

  it('calls remove handler from the delete control', () => {
    const remove = jest.fn()
    const outlet = new Outlet({
      outlet_id: '1',
      name: 'Return Pump',
      pin: 2,
      reverse: false,
      equipment: '',
      driver: drivers[0],
      drivers,
      update: jest.fn(),
      remove
    })

    outlet.handleRemove()

    expect(remove).toHaveBeenCalled()
  })
})
