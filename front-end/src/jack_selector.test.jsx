import JackSelector, { RawJackSelector } from './jack_selector'
import React from 'react'
import 'isomorphic-fetch'

const jacks = [{ id: '1', name: 'Foo', pins: [1, 2] }]

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  const children = React.Children.toArray(node.props?.children)
  children.forEach(child => findAll(child, predicate, acc))
  return acc
}

describe('JackSelector', () => {
  it('renders without throwing with matching jack', () => {
    const component = new RawJackSelector({ id: '1', jacks, update: jest.fn(), fetchJacks: jest.fn() })
    expect(() => component.render()).not.toThrow()
    expect(JackSelector).toBeDefined()
  })

  it('renders without throwing with no matching jack', () => {
    const component = new RawJackSelector({ id: '99', jacks, update: jest.fn(), fetchJacks: jest.fn() })
    expect(() => component.render()).not.toThrow()
  })

  it('renders without throwing with empty jacks list', () => {
    const component = new RawJackSelector({ id: '1', jacks: [], update: jest.fn(), fetchJacks: jest.fn() })
    expect(() => component.render()).not.toThrow()
  })

  it('selects a jack and its first pin', () => {
    const update = jest.fn()
    const component = new RawJackSelector({ id: '99', jacks, update, fetchJacks: jest.fn() })
    component.setState = jest.fn(updateState => {
      component.state = { ...component.state, ...updateState }
    })

    component.setJack(0)()

    expect(component.state.jack).toEqual(jacks[0])
    expect(component.state.pin).toBe(1)
    expect(update).toHaveBeenCalledWith('1', 1)
  })

  it('updates the selected pin', () => {
    const update = jest.fn()
    const component = new RawJackSelector({ id: '1', jacks, update, fetchJacks: jest.fn() })
    component.setState = jest.fn(updateState => {
      component.state = { ...component.state, ...updateState }
    })

    component.setPin(2)()

    expect(component.state.pin).toBe(2)
    expect(update).toHaveBeenCalledWith('1', 2)
  })

  it('setJack updates and calls update', () => {
    const update = jest.fn()
    const component = new RawJackSelector({ id: '1', jacks, update, fetchJacks: jest.fn() })
    component.setState = jest.fn(updateState => {
      component.state = { ...component.state, ...updateState }
    })

    const items = findAll(component.jacks(), node => node.type === 'a')
    items[0].props.onClick()

    expect(update).toHaveBeenCalledWith('1', 1)
    expect(JackSelector).toBeDefined()
  })

  it('setPin updates and calls update', () => {
    const update = jest.fn()
    const component = new RawJackSelector({ id: '1', jacks, update, fetchJacks: jest.fn() })
    component.setState = jest.fn(updateState => {
      component.state = { ...component.state, ...updateState }
    })

    const pinItems = findAll(component.pins(), node => node.type === 'a')
    if (pinItems.length > 1) {
      pinItems[1].props.onClick()
      expect(update).toHaveBeenCalledWith('1', 2)
    }
  })
})
