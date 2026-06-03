import JackSelector, { RawJackSelector } from './jack_selector'
import React from 'react'
import 'isomorphic-fetch'

const jacks = [{ id: '1', name: 'Foo', pins: [1, 2] }]

describe('JackSelector', () => {
  it('renders without throwing with matching jack', () => {
    const component = new RawJackSelector({ id: '1', jacks, update: jest.fn(), fetchJacks: jest.fn() })
    const rendered = component.render()

    // render() returns a <div> containing jacks() and pins() Menu elements
    expect(rendered).toBeTruthy()
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

  it('fetches jacks on mount', () => {
    const fetchJacks = jest.fn()
    const component = new RawJackSelector({ id: '1', jacks, update: jest.fn(), fetchJacks })

    component.componentDidMount()

    expect(fetchJacks).toHaveBeenCalled()
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

  it('setJack updates and calls update via onSelect', () => {
    const update = jest.fn()
    const component = new RawJackSelector({ id: '1', jacks, update, fetchJacks: jest.fn() })
    component.setState = jest.fn(updateState => {
      component.state = { ...component.state, ...updateState }
    })

    // jacks() returns a Menu element — verify via setJack directly
    component.setJack(0)()
    expect(update).toHaveBeenCalledWith('1', 1)
    expect(JackSelector).toBeDefined()
  })

  it('setJack ignores missing index', () => {
    const update = jest.fn()
    const component = new RawJackSelector({ id: '1', jacks, update, fetchJacks: jest.fn() })
    const previousState = component.state

    component.setJack(99)()

    expect(component.state).toBe(previousState)
    expect(update).not.toHaveBeenCalled()
  })

  it('setPin updates and calls update', () => {
    const update = jest.fn()
    const component = new RawJackSelector({ id: '1', jacks, update, fetchJacks: jest.fn() })
    component.setState = jest.fn(updateState => {
      component.state = { ...component.state, ...updateState }
    })

    // pins are [1, 2]; setPin(2) should update correctly
    component.setPin(2)()
    expect(update).toHaveBeenCalledWith('1', 2)
  })
})
