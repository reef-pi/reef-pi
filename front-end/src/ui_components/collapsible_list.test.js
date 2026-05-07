import React from 'react'
import CollapsibleList from './collapsible_list'

const Item = (props) => <div name={props.name}>{props.name}</div>

describe('CollapsibleList', () => {
  const makeList = (children) => {
    const instance = new CollapsibleList({ children })
    instance.setState = update => {
      const next = typeof update === 'function' ? update(instance.state, instance.props) : update
      instance.state = { ...instance.state, ...next }
    }
    return instance
  }

  const renderedChildren = (instance) => React.Children.toArray(instance.render().props.children)

  it('renders children', () => {
    const list = makeList([
      <Item key='a' name='a' />,
      <Item key='b' name='b' />
    ])
    expect(renderedChildren(list)).toHaveLength(2)
  })

  it('starts collapsed (expanded false) for items without defaultOpen', () => {
    const list = makeList(<Item name='x' />)
    expect(list.state.expanded.x).toBe(false)
  })

  it('starts expanded for items with defaultOpen', () => {
    const list = makeList(<Item name='y' defaultOpen />)
    expect(list.state.expanded.y).toBe(true)
  })

  it('starts readOnly for all items', () => {
    const list = makeList(<Item name='z' />)
    expect(list.state.readOnly.z).toBe(true)
  })

  it('onToggle toggles expanded state when readOnly', () => {
    const list = makeList(<Item name='t' />)
    list.onToggle('t')
    expect(list.state.expanded.t).toBe(true)
    list.onToggle('t')
    expect(list.state.expanded.t).toBe(false)
  })

  it('onToggle does not toggle when not readOnly (editing)', () => {
    const list = makeList(<Item name='e' />)
    list.onEdit('e')
    expect(list.state.readOnly.e).toBe(false)
    list.onToggle('e')
    expect(list.state.expanded.e).toBe(true)
  })

  it('onEdit expands and sets readOnly to false', () => {
    const list = makeList(<Item name='ed' />)
    list.onEdit('ed')
    expect(list.state.expanded.ed).toBe(true)
    expect(list.state.readOnly.ed).toBe(false)
  })

  it('onSubmit collapses and sets readOnly to true', () => {
    const list = makeList(<Item name='s' />)
    list.onEdit('s')
    list.onSubmit('s')
    expect(list.state.expanded.s).toBe(false)
    expect(list.state.readOnly.s).toBe(true)
  })

  it('getDerivedStateFromProps adds new child as collapsed', () => {
    const initial = makeList(<Item name='first' />)
    const derived = CollapsibleList.getDerivedStateFromProps(
      { children: [<Item key='new' name='new' />] },
      initial.state
    )
    expect(derived.expanded.new).toBe(false)
    expect(derived.readOnly.new).toBe(true)
  })

  it('getDerivedStateFromProps does not mutate previous state', () => {
    const state = {
      expanded: { first: true },
      readOnly: { first: false },
      other: 'value'
    }

    const derived = CollapsibleList.getDerivedStateFromProps(
      { children: [<Item key='new' name='new' />] },
      state
    )

    expect(derived).not.toBe(state)
    expect(derived.expanded).not.toBe(state.expanded)
    expect(derived.readOnly).not.toBe(state.readOnly)
    expect(state).toEqual({
      expanded: { first: true },
      readOnly: { first: false },
      other: 'value'
    })
    expect(derived).toEqual({
      expanded: { first: true, new: false },
      readOnly: { first: false, new: true },
      other: 'value'
    })
  })

  it('passes expanded, readOnly, onToggle, onEdit, onSubmit to children', () => {
    const list = makeList(<Item name='p' />)
    const child = renderedChildren(list)[0]
    expect(child.props.expanded).toBeDefined()
    expect(child.props.readOnly).toBeDefined()
    expect(typeof child.props.onToggle).toBe('function')
    expect(typeof child.props.onEdit).toBe('function')
    expect(typeof child.props.onSubmit).toBe('function')
  })
})
