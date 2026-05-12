import React from 'react'
import Modal from './modal'
import 'isomorphic-fetch'

const renderModal = children => new Modal({ children }).render()

const topLevelChildren = tree => React.Children.toArray(tree.props.children)

describe('<Modal />', () => {
  it('renders backdrop before modal', () => {
    const tree = renderModal(<div />)
    const children = topLevelChildren(tree)

    expect(children).toHaveLength(2)
    expect(children[0].type).toBe('div')
    expect(children[0].props.className).toBe('modal-backdrop show')
    expect(children[1].type).toBe('div')
    expect(children[1].props.className).toBe('modal show')
  })

  it('renders modal attributes', () => {
    const tree = renderModal(<div />)
    const modal = topLevelChildren(tree)[1]

    expect(modal.props.role).toBe('dialog')
    expect(modal.props.tabIndex).toBe('-1')
    expect(modal.props['aria-hidden']).toBe('false')
    expect(modal.props.style).toEqual({ display: 'block' })
  })

  it('renders modal-dialog and modal-content around children', () => {
    const child = <span id='child'>hello</span>
    const tree = renderModal(child)
    const modal = topLevelChildren(tree)[1]
    const dialog = React.Children.only(modal.props.children)
    const content = React.Children.only(dialog.props.children)

    expect(dialog.type).toBe('div')
    expect(dialog.props.className).toBe('modal-dialog')
    expect(content.type).toBe('div')
    expect(content.props.className).toBe('modal-content')
    expect(content.props.children).toBe(child)
  })

  it('renders without children', () => {
    const tree = new Modal({}).render()
    const modal = topLevelChildren(tree)[1]
    const dialog = React.Children.only(modal.props.children)
    const content = React.Children.only(dialog.props.children)

    expect(content.props.className).toBe('modal-content')
    expect(content.props.children).toBeUndefined()
  })
})
