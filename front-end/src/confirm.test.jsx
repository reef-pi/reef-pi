import React from 'react'
import Confirm from './confirm'

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

describe('<Confirm />', () => {
  it('renders default labels and optional description', () => {
    const component = new Confirm({
      message: 'Delete item?',
      description: <span id='description'>This cannot be undone.</span>
    })

    const tree = component.render()
    expect(JSON.stringify(tree)).toContain('Delete item?')
    expect(JSON.stringify(tree)).toContain('description')
    expect(findAll(tree, node => node.type === 'button')).toHaveLength(2)
  })

  it('uses custom labels and omits body without description', () => {
    const component = new Confirm({
      message: 'Continue?',
      confirmLabel: 'Yes',
      abortLabel: 'No'
    })

    const tree = component.render()
    expect(component.state.abortLabel).toBe('No')
    expect(component.state.confirmLabel).toBe('Yes')
    expect(findAll(tree, node => node.type === 'button')).toHaveLength(2)
    expect(JSON.stringify(tree)).not.toContain('modal-body')
  })

  it('focuses confirm button on mount', () => {
    const component = new Confirm({ message: 'Continue?' })
    component.confirmRef.current = { focus: jest.fn() }

    component.componentDidMount()

    expect(component.confirmRef.current.focus).toHaveBeenCalled()
    expect(component.promise).toBeDefined()
  })

  it('resolves or rejects its promise from button handlers', () => {
    const component = new Confirm({ message: 'Continue?' })
    component.promise = {
      resolve: jest.fn(),
      reject: jest.fn()
    }

    component.handleConfirm()
    component.handleAbort()

    expect(component.promise.resolve).toHaveBeenCalled()
    expect(component.promise.reject).toHaveBeenCalled()
  })
})
