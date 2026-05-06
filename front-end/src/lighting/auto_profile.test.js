import React from 'react'
import AutoProfile from './auto_profile'
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

const textContent = (node) => {
  if (node === undefined || node === null || typeof node === 'boolean') {
    return ''
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  return React.Children.toArray(node.props?.children).map(textContent).join('')
}

const renderProfile = (config, extraProps = {}) => {
  const component = new AutoProfile({
    name: 'profile',
    config,
    onChangeHandler: extraProps.onChangeHandler || jest.fn(),
    touched: {},
    errors: {},
    ...extraProps
  })
  component.setState = jest.fn(update => {
    component.state = { ...component.state, ...update }
  })
  return component
}

describe('Lighting ui - Auto Profile', () => {
  const ev = {
    target: { value: 10 }
  }

  it('<AutoProfile />', () => {
    const config = {
      start: '14:00:00',
      end: '20:00:00',
      values: []
    }
    let m = renderProfile(config)
    m.curry(1)(ev)
    m = renderProfile(config)
    m.curry(1)({ target: { value: 'foo' } })
  })

  it('<AutoProfile /> should default to 12 values', () => {
    const config = {
      start: '14:00:00',
      end: '20:00:00'
    }
    const m = renderProfile(config)
    expect(findAll(m.render(), node => node.type === 'input' && String(node.props?.className).includes('no-spinner'))).toHaveLength(12)
  })

  it('<AutoProfile /> should set labels based on start end and values', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20.3, 30]
    }

    const m = renderProfile(config)
    const labels = findAll(m.render(), node => String(node.props?.className).includes('order-md-last'))
    expect(labels.length).toBe(3)
    expect(textContent(labels[0])).toBe('14:00')
    expect(textContent(labels[1])).toBe('14:30')
    expect(textContent(labels[2])).toBe('15:00')
  })

  it('<AutoProfile /> sliderList does not mutate state values', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, undefined, 30]
    }

    const m = renderProfile(config)
    m.sliderList()

    expect(m.state.values).toEqual([10, undefined, 30])
  })

  it('<AutoProfile /> should set add labels based when Add Point is clicked', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20.3, 30]
    }

    const m = renderProfile(config)
    const addButton = findAll(m.render(), node => String(node.props?.className).includes('btn-add-point'))[0]
    addButton.props.onClick()
    findAll(m.render(), node => String(node.props?.className).includes('btn-add-point'))[0].props.onClick()

    const labels = findAll(m.render(), node => String(node.props?.className).includes('order-md-last'))
    expect(labels.length).toBe(5)
    expect(textContent(labels[0])).toBe('14:00')
    expect(textContent(labels[1])).toBe('14:15')
    expect(textContent(labels[2])).toBe('14:30')
    expect(textContent(labels[3])).toBe('14:45')
    expect(textContent(labels[4])).toBe('15:00')
  })

  it('<AutoProfile /> should set remove labels based when Remove Point is clicked', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20, 30]
    }

    const m = renderProfile(config)
    findAll(m.render(), node => String(node.props?.className).includes('btn-remove-point'))[1].props.onClick()

    const labels = findAll(m.render(), node => String(node.props?.className).includes('order-md-last'))
    expect(labels.length).toBe(2)
    expect(textContent(labels[0])).toBe('14:00')
    expect(textContent(labels[1])).toBe('15:00')
  })

  it('<AutoProfile /> Should allow end time before start time to represent overnight', () => {
    const config = {
      start: '23:00:00',
      end: '02:00:00',
      values: [10, 20, 30, 40]
    }

    const m = renderProfile(config)
    const labels = findAll(m.render(), node => String(node.props?.className).includes('order-md-last'))
    expect(labels.length).toBe(4)
    expect(textContent(labels[0])).toBe('23:00')
    expect(textContent(labels[1])).toBe('00:00')
    expect(textContent(labels[2])).toBe('01:00')
    expect(textContent(labels[3])).toBe('02:00')
  })

  it('<AutoProfile /> Should allow end time before start time with same hour to represent overnight', () => {
    const config = {
      start: '02:45:00',
      end: '02:15:00',
      values: [10, 20, 30]
    }

    const m = renderProfile(config)
    const labels = findAll(m.render(), node => String(node.props?.className).includes('order-md-last'))
    expect(labels.length).toBe(3)
    expect(textContent(labels[0])).toBe('02:45')
    expect(textContent(labels[1])).toBe('14:30')
    expect(textContent(labels[2])).toBe('02:15')
  })
})
