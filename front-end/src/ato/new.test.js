import React from 'react'
import 'isomorphic-fetch'
import New, { RawNewATO } from './new'

describe('New ATO', () => {
  const countByType = (node, predicate) => {
    if (!node || typeof node !== 'object') {
      return 0
    }
    let count = predicate(node) ? 1 : 0
    React.Children.toArray(node.props?.children).forEach(child => {
      count += countByType(child, predicate)
    })
    return count
  }

  it('<New /> toggles and submits', () => {
    const createATO = jest.fn()
    const component = new RawNewATO({
      createATO,
      inlets: [],
      equipment: [],
      macros: []
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    expect(New).toBeDefined()

    component.handleToggle()
    expect(component.state.add).toBe(true)
    expect(component.state.period).toBe(60)

    component.handleSubmit({
      name: 'test',
      enable: true,
      inlet: '3',
      period: 60,
      control: 'macro',
      pump: 'p1',
      disable_on_alert: true,
      notify: true,
      maxAlert: 30,
      one_shot: false
    })

    expect(createATO).toHaveBeenCalledWith({
      name: 'test',
      enable: true,
      inlet: '3',
      period: 60,
      control: true,
      pump: 'p1',
      disable_on_alert: true,
      notify: {
        enable: true,
        max: 30
      },
      is_macro: true,
      one_shot: false
    })
    expect(component.state.add).toBe(false)
  })

  it('renders add form only when toggled on', () => {
    const component = new RawNewATO({
      createATO: jest.fn(),
      inlets: [],
      equipment: [],
      macros: []
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    expect(countByType(component.render(), node => node.props?.id === 'add_new_ato_sensor')).toBe(1)
    expect(component.ui()).toBeUndefined()

    component.handleToggle()
    expect(component.ui()).toBeTruthy()
  })
})
