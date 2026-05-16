import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Inlet from './inlet'
import { showUpdateSuccessful } from 'utils/alert'

jest.mock('utils/alert', () => ({
  showUpdateSuccessful: jest.fn()
}))

const drivers = [
  { id: 'rpi', name: 'Raspberry Pi', pinmap: { 'digital-input': [1, 2, 3] } },
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

describe('<Inlet />', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders view mode with driver, in-use, and reverse labels', () => {
    const inlet = new Inlet({
      inlet_id: '1',
      name: 'Float Switch',
      pin: 2,
      reverse: true,
      equipment: 'ato',
      driver: drivers[0],
      drivers,
      update: jest.fn(),
      remove: jest.fn()
    })

    const html = renderToStaticMarkup(inlet.render())

    expect(html).toContain('Float Switch')
    expect(html).toContain('Raspberry Pi')
    expect(html).toContain('(2)')
    expect(inlet.state.reverse).toBe(true)
    expect(inlet.props.equipment).toBe('ato')
  })

  it('edits name, pin, driver, reverse state, and saves payload', () => {
    const update = jest.fn()
    const inlet = new Inlet({
      inlet_id: '1',
      name: 'Float Switch',
      pin: 2,
      reverse: false,
      equipment: '',
      driver: drivers[0],
      drivers,
      update,
      remove: jest.fn()
    })
    patchSetState(inlet)

    inlet.handleEdit()
    expect(inlet.state.edit).toBe(true)
    expect(renderToStaticMarkup(inlet.render())).toContain('inlet-1-name')

    inlet.handleNameChange({ target: { value: 'Sump High' } })
    inlet.onPinChange(3)
    inlet.handleDriverChange({ target: { value: 'missing' } })
    expect(inlet.state.driver).toEqual({})
    inlet.handleDriverChange({ target: { value: 'rpi' } })
    inlet.handleReverseChange()
    inlet.handleEdit()

    expect(update).toHaveBeenCalledWith({
      name: 'Sump High',
      pin: 3,
      reverse: true,
      equipment: '',
      driver: 'rpi'
    })
    expect(showUpdateSuccessful).toHaveBeenCalled()
    expect(inlet.state.edit).toBe(false)
  })

  it('calls remove handler from the delete control', () => {
    const remove = jest.fn()
    const inlet = new Inlet({
      inlet_id: '1',
      name: 'Float Switch',
      pin: 2,
      reverse: false,
      equipment: '',
      driver: drivers[0],
      drivers,
      update: jest.fn(),
      remove
    })

    inlet.handleRemove()

    expect(remove).toHaveBeenCalled()
  })
})
