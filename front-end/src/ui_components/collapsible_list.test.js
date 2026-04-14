import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CollapsibleList from './collapsible_list'

const Item = (props) => <div name={props.name}>{props.name}</div>

describe('CollapsibleList', () => {
  const createList = (children) => {
    const list = new CollapsibleList({ children })
    list.setState = jest.fn(update => {
      list.state = { ...list.state, ...update }
    })
    return list
  }

  it('renders children', () => {
    expect(renderToStaticMarkup(
      <CollapsibleList>
        <Item name='a' />
        <Item name='b' />
      </CollapsibleList>
    )).toContain('a')
  })

  it('starts collapsed (expanded false) for items without defaultOpen', () => {
    const list = createList(<Item name='x' />)
    expect(list.state.expanded.x).toBe(false)
  })

  it('starts expanded for items with defaultOpen', () => {
    const list = createList(<Item name='y' defaultOpen />)
    expect(list.state.expanded.y).toBe(true)
  })

  it('starts readOnly for all items', () => {
    const list = createList(<Item name='z' />)
    expect(list.state.readOnly.z).toBe(true)
  })

  it('onToggle toggles expanded state when readOnly', () => {
    const list = createList(<Item name='t' />)
    list.onToggle('t')
    expect(list.state.expanded.t).toBe(true)
    list.onToggle('t')
    expect(list.state.expanded.t).toBe(false)
  })

  it('onToggle does not toggle when not readOnly (editing)', () => {
    const list = createList(<Item name='e' />)
    list.onEdit('e')
    expect(list.state.readOnly.e).toBe(false)
    list.onToggle('e')
    expect(list.state.expanded.e).toBe(true)
  })

  it('onEdit expands and sets readOnly to false', () => {
    const list = createList(<Item name='ed' />)
    list.onEdit('ed')
    expect(list.state.expanded.ed).toBe(true)
    expect(list.state.readOnly.ed).toBe(false)
  })

  it('onSubmit collapses and sets readOnly to true', () => {
    const list = createList(<Item name='s' />)
    list.onEdit('s')
    list.onSubmit('s')
    expect(list.state.expanded.s).toBe(false)
    expect(list.state.readOnly.s).toBe(true)
  })

  it('getDerivedStateFromProps adds new child as collapsed', () => {
    const state = { expanded: { first: false }, readOnly: { first: true } }
    const next = CollapsibleList.getDerivedStateFromProps({ children: [<Item key='new' name='new' />] }, state)
    expect(next.expanded.new).toBe(false)
    expect(next.readOnly.new).toBe(true)
  })

  it('passes expanded, readOnly, onToggle, onEdit, onSubmit to children', () => {
    const list = createList(<Item name='p' />)
    const output = list.render()
    const child = output.props.children[0]
    expect(child.props.expanded).toBe(false)
    expect(child.props.readOnly).toBe(true)
    expect(typeof child.props.onToggle).toBe('function')
    expect(typeof child.props.onEdit).toBe('function')
    expect(typeof child.props.onSubmit).toBe('function')
  })
})
