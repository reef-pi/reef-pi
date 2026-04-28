import React from 'react'
import Modal from './modal'
import 'isomorphic-fetch'

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => findAll(child, predicate, acc))
  return acc
}

describe('<Modal />', () => {
  it('renders children inside modal-content', () => {
    const tree = new Modal({ children: <span id='child'>hello</span> }).render()
    expect(findAll(tree, node => node.props?.id === 'child')).toHaveLength(1)
  })

  it('renders modal-backdrop', () => {
    const tree = new Modal({ children: <div /> }).render()
    expect(React.Children.toArray(tree.props.children)[0].props.className).toBe('modal-backdrop show')
  })

  it('renders modal div with role=dialog', () => {
    const tree = new Modal({ children: <div /> }).render()
    expect(React.Children.toArray(tree.props.children)[1].props.role).toBe('dialog')
  })

  it('renders without children', () => {
    expect(() => new Modal({}).render()).not.toThrow()
  })
})
