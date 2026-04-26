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
