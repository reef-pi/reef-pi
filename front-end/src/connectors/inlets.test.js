import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RawInlets } from './inlets'
import Inlet from './inlet'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn(() => Promise.resolve(true))
}))

const drivers = [
  { id: 'rpi', name: 'Raspberry Pi', pinmap: { 'digital-input': [1, 2, 3] } },
  { id: 'other', name: 'Other Board', pinmap: { 'digital-input': [4] } }
]

const patchSetState = component => {
  component.setState = update => {
    component.state = {
      ...component.state,
      ...(typeof update === 'function' ? update(component.state) : update)
    }
  }
}

describe('<Inlets />', () => {
  it('groups sorted inlet rows by display driver and preserves input order', () => {
    const inlets = [
      { id: '2', name: 'Sump Low', pin: 2, reverse: false, driver: 'rpi' },
      { id: '1', name: 'ATO High', pin: 1, reverse: true, driver: 'missing' },
      { id: '3', name: 'ATO Low', pin: 3, reverse: false, driver: 'rpi' }
    ]
    const component = new RawInlets({
      inlets,
      drivers,
      fetch: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    })

    const list = component.list()

    expect(list.filter(item => item.type === Inlet).map(item => item.props.name))
      .toEqual(['ATO Low', 'Sump Low', 'ATO High'])
    expect(renderToStaticMarkup(<>{list}</>)).toContain('Raspberry Pi')
    expect(renderToStaticMarkup(<>{list}</>)).toContain('missing')
    expect(inlets.map(inlet => inlet.name)).toEqual(['Sump Low', 'ATO High', 'ATO Low'])
  })

  it('adds, saves, resets add state, and fetches after child updates', () => {
    const create = jest.fn()
    const update = jest.fn()
    const fetch = jest.fn()
    const component = new RawInlets({
      inlets: [{ id: '1', name: 'ATO Low', pin: 1, reverse: false, driver: 'rpi' }],
      drivers,
      fetch,
      create,
      delete: jest.fn(),
      update
    })
    patchSetState(component)

    component.componentDidMount()
    component.handleAdd()
    component.handleNameChange({ target: { value: 'Sump High' } })
    component.onPinChange(4)
    component.handleDriverChange({ target: { value: 'missing' } })
    expect(component.state.driver).toEqual({})
    component.handleDriverChange({ target: { value: 'other' } })
    component.handleReverseChange()
    component.handleSave()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith({
      name: 'Sump High',
      pin: 4,
      reverse: true,
      driver: 'other'
    })
    expect(component.state.add).toBe(false)

    const inlet = component.list().find(item => item.type === Inlet)
    inlet.props.update({ name: 'ATO Low Updated', pin: 2, reverse: true, driver: 'rpi' })
    expect(update).toHaveBeenCalledWith('1', { name: 'ATO Low Updated', pin: 2, reverse: true, driver: 'rpi' })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('confirms and deletes an inlet', async () => {
    const del = jest.fn()
    const component = new RawInlets({
      inlets: [],
      drivers,
      fetch: jest.fn(),
      create: jest.fn(),
      delete: del,
      update: jest.fn()
    })

    component.remove({ id: '1', name: 'ATO Low' })()
    await Promise.resolve()

    expect(del).toHaveBeenCalledWith('1')
  })
})
