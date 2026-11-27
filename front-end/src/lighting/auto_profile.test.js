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
    const labels = findAll(m.render(), node => node.type === 'time' && node.props?.className === 'reefpi-lighting-schedule__time')
    expect(labels.length).toBe(3)
    expect(textContent(labels[0])).toBe('14:00')
    expect(textContent(labels[1])).toBe('14:30')
    expect(textContent(labels[2])).toBe('15:00')
  })

  it('<AutoProfile /> renders an accessible preview and exact schedule editor', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20.3, 30]
    }

    const m = renderProfile(config)
    const tree = m.render()
    const preview = findAll(tree, node => node.props?.['data-testid'] === 'lighting-interval-preview')[0]
    const schedule = findAll(tree, node => node.props?.['data-testid'] === 'lighting-schedule-list')[0]
    const rows = findAll(tree, node => node.props?.['data-testid'] === 'lighting-schedule-point')
    const valueInputs = findAll(tree, node => node.type === 'input' && node.props?.name?.startsWith('profile.values.'))

    expect(preview.type).toBe('svg')
    expect(preview.props.role).toBe('img')
    expect(textContent(preview)).toContain('24-hour intensity preview')
    expect(schedule.type).toBe('ol')
    expect(rows).toHaveLength(3)
    expect(valueInputs.map(input => input.props.name)).toEqual([
      'profile.values.0',
      'profile.values.1',
      'profile.values.2'
    ])
    expect(valueInputs.every(input => input.props.min === 0 && input.props.max === 100)).toBe(true)
    expect(valueInputs.map(input => input.props['aria-label'])).toEqual([
      'Intensity at 14:00 (%)',
      'Intensity at 14:30 (%)',
      'Intensity at 15:00 (%)'
    ])
  })

  it('<AutoProfile /> exposes time and intensity units without relying on the chart', () => {
    const m = renderProfile({
      start: '08:00:00',
      end: '20:00:00',
      values: [0, 100]
    })
    const tree = m.render()

    expect(textContent(findAll(tree, node => node.props?.['data-testid'] === 'lighting-schedule-heading')[0])).toContain('Schedule points')
    expect(textContent(tree)).toContain('Time')
    expect(textContent(tree)).toContain('Intensity (%)')
    expect(textContent(tree)).toContain('0–100%')
  })

  it('<AutoProfile /> does not fabricate preview times while time fields are invalid', () => {
    const m = renderProfile({
      start: '',
      end: 'not-a-time',
      values: [0, 100]
    })
    const preview = findAll(m.render(), node => node.props?.['data-testid'] === 'lighting-interval-preview')[0]

    expect(textContent(preview)).toContain('time not set')
    expect(textContent(preview)).not.toContain('NaN')
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

    const labels = findAll(m.render(), node => node.type === 'time' && node.props?.className === 'reefpi-lighting-schedule__time')
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

    const labels = findAll(m.render(), node => node.type === 'time' && node.props?.className === 'reefpi-lighting-schedule__time')
    expect(labels.length).toBe(2)
    expect(textContent(labels[0])).toBe('14:00')
    expect(textContent(labels[1])).toBe('15:00')
  })

  it('<AutoProfile /> removes a point without mutating the original values', () => {
    const onChangeHandler = jest.fn()
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20, 30]
    }

    const m = renderProfile(config, { onChangeHandler })
    m.handleRemovePoint(1)

    expect(onChangeHandler).toHaveBeenCalledWith({
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 30]
    })
    expect(m.state.values).toEqual([10, 30])
    expect(config.values).toEqual([10, 20, 30])
  })

  it('<AutoProfile /> Should allow end time before start time to represent overnight', () => {
    const config = {
      start: '23:00:00',
      end: '02:00:00',
      values: [10, 20, 30, 40]
    }

    const m = renderProfile(config)
    const labels = findAll(m.render(), node => node.type === 'time' && node.props?.className === 'reefpi-lighting-schedule__time')
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
    const labels = findAll(m.render(), node => node.type === 'time' && node.props?.className === 'reefpi-lighting-schedule__time')
    expect(labels.length).toBe(3)
    expect(textContent(labels[0])).toBe('02:45')
    expect(textContent(labels[1])).toBe('14:30')
    expect(textContent(labels[2])).toBe('02:15')
  })
})
