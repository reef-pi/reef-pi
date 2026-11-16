import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
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
    expect(children[1].props.className).toBe('modal in')
  })

  it('renders modal attributes', () => {
    const tree = renderModal(<div />)
    const modal = topLevelChildren(tree)[1]

    expect(modal.props.role).toBe('dialog')
    expect(modal.props.tabIndex).toBe('-1')
    expect(modal.props['aria-modal']).toBe('true')
    expect(modal.props.style).toBeUndefined()
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

  it('labels the dialog by the given element id', () => {
    const tree = new Modal({ labelledBy: 'title-id' }).render()
    expect(topLevelChildren(tree)[1].props['aria-labelledby']).toBe('title-id')
  })

  it('calls onEscape on Escape and ignores other keys', () => {
    const onEscape = jest.fn()
    render(<Modal onEscape={onEscape}><button>one</button></Modal>)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'a' })
    expect(onEscape).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('traps Tab focus inside the dialog', () => {
    render(<Modal><button>first</button><button>last</button></Modal>)
    const dialog = screen.getByRole('dialog')
    const first = screen.getByText('first')
    const last = screen.getByText('last')

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    first.focus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)

    fireEvent.keyDown(dialog, { key: 'Tab' })
  })
})
