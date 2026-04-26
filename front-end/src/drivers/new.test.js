import React from 'react'
import 'isomorphic-fetch'
import New from './new'

describe('New Driver', () => {
  it('<New /> toggles and renders form', () => {
    const validate = jest.fn(() => Promise.resolve({ status: 200 }))
    const hook = jest.fn()
    const component = new New({
      validate,
      hook,
      driverOptions: []
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    const rendered = component.render()
    expect(rendered.type).toBe('div')

    component.handleToggle()
    expect(component.state.add).toBe(true)
    expect(component.ui()).toBeTruthy()
  })

  it('submits valid payloads and resets state', async () => {
    const validate = jest.fn(() => Promise.resolve({ status: 200 }))
    const hook = jest.fn()
    const component = new New({
      validate,
      hook,
      driverOptions: []
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    await component.handleAdd(
      { name: 'driver', type: 'foo', config: { pin: 1 } },
      { setErrors: jest.fn() }
    )

    expect(validate).toHaveBeenCalledWith({
      name: 'driver',
      type: 'foo',
      config: { pin: 1 }
    })
    expect(hook).toHaveBeenCalledWith({
      name: 'driver',
      type: 'foo',
      config: { pin: 1 }
    })
  })

  it('maps validation errors for bad payloads', async () => {
    const response = {
      status: 400,
      json: jest.fn(() => Promise.resolve({
        name: 'required',
        'config.pin': 'invalid'
      }))
    }
    const validate = jest.fn(() => Promise.resolve(response))
    const setErrors = jest.fn()
    const component = new New({
      validate,
      hook: jest.fn(),
      driverOptions: []
    })

    await component.handleAdd(
      { name: '', type: 'foo', config: { pin: '' } },
      { setErrors }
    )
    await Promise.resolve()

    expect(setErrors).toHaveBeenCalledWith({
      name: 'required',
      'config.pin': 'invalid',
      config: {
        pin: 'invalid'
      }
    })
  })
})
