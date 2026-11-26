import React from 'react'
import Capabilities from './capabilities'

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

const findLabels = (node, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (node.type === 'label') {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => findLabels(child, acc))
  return acc
}

describe('render capabilities component', () => {
  it('<Capabilities />', () => {
    const update = jest.fn()
    const component = new Capabilities({ capabilities: {}, update })
    component.setState = jest.fn(next => {
      component.state = { ...component.state, ...next }
    })

    const rendered = component.render()
    const labels = findLabels(rendered)

    expect(labels.length).toBeGreaterThan(10)
    expect(countByType(rendered, node => node.type === 'input' && node.props.type === 'checkbox')).toBeGreaterThan(5)

    component.updateCapability('equipment')({ target: { checked: true } })
    expect(update).toHaveBeenCalled()
  })
})

describe('Capabilities prop sync', () => {
  it('re-syncs checkbox state when the parent passes new capabilities', () => {
    const initial = { equipment: false }
    const loaded = { equipment: true }
    const state = { capabilities: initial, source: initial }
    expect(Capabilities.getDerivedStateFromProps({ capabilities: initial }, state)).toBeNull()
    expect(Capabilities.getDerivedStateFromProps({ capabilities: loaded }, state))
      .toEqual({ capabilities: loaded, source: loaded })
  })
})
