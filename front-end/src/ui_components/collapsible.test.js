import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CollapsibleList from './collapsible_list'
import Collapsible from './collapsible'

describe('Collapsible', () => {
  const noop = () => {}
  const Content = (props) => {
    return (
      <div>
        This is inner content
        <button type='button' id='submit' onClick={() => props.onSubmit('ok')}>click</button>
      </div>
    )
  }

  const makeCollapsible = (props = {}) => {
    const instance = new Collapsible({
      name: 'test',
      title: 'title',
      expanded: false,
      readOnly: true,
      item: { id: 1, name: 'item' },
      onToggle: jest.fn(),
      onDelete: jest.fn(),
      onEdit: jest.fn(),
      onSubmit: jest.fn(),
      children: <Content onSubmit={jest.fn()} />,
      ...props
    })
    instance.setState = update => {
      const next = typeof update === 'function' ? update(instance.state, instance.props) : update
      instance.state = { ...instance.state, ...next }
    }
    return instance
  }

  const makeCollapsibleList = (children) => {
    const instance = new CollapsibleList({ children })
    instance.setState = update => {
      const next = typeof update === 'function' ? update(instance.state, instance.props) : update
      instance.state = { ...instance.state, ...next }
    }
    return instance
  }

  const visitElements = (node, predicate, matches = []) => {
    if (node == null || typeof node === 'boolean') {
      return matches
    }
    if (Array.isArray(node)) {
      node.forEach(child => visitElements(child, predicate, matches))
      return matches
    }
    if (React.isValidElement(node)) {
      if (predicate(node)) {
        matches.push(node)
      }
      visitElements(node.props && node.props.children, predicate, matches)
    }
    return matches
  }

  it('does not show content when collapsed', () => {
    const instance = makeCollapsible({ expanded: false })
    const markup = renderToStaticMarkup(instance.render())
    expect(markup).not.toContain('This is inner content')
    expect(markup).not.toContain('id="submit"')
  })

  it('shows content when expanded', () => {
    const instance = makeCollapsible({ expanded: true, readOnly: false })
    const markup = renderToStaticMarkup(instance.render())
    expect(markup).toContain('This is inner content')
    expect(markup).toContain('id="submit"')
  })

  it('shows Edit button when readOnly', () => {
    const instance = makeCollapsible({ expanded: true, readOnly: true })
    const markup = renderToStaticMarkup(instance.render())
    expect(markup).toContain('id="edit-test"')
  })

  it('does not show Edit button when readOnly is false', () => {
    const instance = makeCollapsible({ expanded: true, readOnly: false })
    const markup = renderToStaticMarkup(instance.render())
    expect(markup).not.toContain('id="edit-test"')
  })

  it('fires edit function', () => {
    const onEdit = jest.fn()
    const instance = makeCollapsible({ onEdit })
    const event = { stopPropagation: jest.fn() }
    instance.handleEdit(event)
    expect(event.stopPropagation).toHaveBeenCalled()
    expect(onEdit).toHaveBeenCalledWith('test')
  })

  it('fires delete function', () => {
    const item = { id: 7 }
    const onDelete = jest.fn()
    const instance = makeCollapsible({ item, onDelete })
    const event = { stopPropagation: jest.fn() }
    instance.handleDelete(event)
    expect(event.stopPropagation).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith(item)
  })

  it('fires onToggle function', () => {
    const onToggle = jest.fn()
    const instance = makeCollapsible({ expanded: true, onToggle })
    const titleNode = visitElements(
      instance.render(),
      element => typeof element.props.className === 'string' && element.props.className.includes('collapsible-title')
    )[0]

    titleNode.props.onClick()
    expect(onToggle).toHaveBeenCalledWith('test')
  })

  it('fires submit function and forwards values to the child submit handler', () => {
    const onSubmit = jest.fn()
    const childSubmit = jest.fn()
    const instance = makeCollapsible({
      expanded: true,
      onSubmit,
      children: <Content onSubmit={childSubmit} />
    })

    const child = visitElements(instance.render(), element => element.type === Content)[0]
    child.props.onSubmit('done')

    expect(onSubmit).toHaveBeenCalledWith('test')
    expect(childSubmit).toHaveBeenCalledWith('done')
  })

  it('expands and clears readOnly when edit is clicked in CollapsibleList', () => {
    const child = <Collapsible name='test' title='title'><Content onSubmit={noop} /></Collapsible>
    const list = makeCollapsibleList(child)

    expect(list.state.expanded.test).toBe(false)
    expect(list.state.readOnly.test).toBe(true)

    list.onEdit('test')
    expect(list.state.expanded.test).toBe(true)
    expect(list.state.readOnly.test).toBe(false)
  })

  it('adds a new panel as collapsed', () => {
    const initialChild = <Collapsible name='test' title='title'><Content onSubmit={noop} /></Collapsible>
    const state = makeCollapsibleList(initialChild).state
    const nextChildren = [<Collapsible key='another' name='another' title='another'><div /></Collapsible>]

    const derived = CollapsibleList.getDerivedStateFromProps({ children: nextChildren }, state)
    expect(derived.expanded.another).toBe(false)
    expect(derived.readOnly.another).toBe(true)
  })
})
