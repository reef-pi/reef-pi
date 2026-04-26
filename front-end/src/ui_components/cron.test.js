import React from 'react'
import Cron from './cron'

const defaultProps = {
  values: { month: '*', week: '*', day: '*', hour: '*', minute: '*', second: '0' },
  errors: {},
  touched: {}
}

const findFields = (node, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (node.type && node.type.name === 'Field' && node.props && node.props.name) {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => findFields(child, acc))
  return acc
}

describe('Cron', () => {
  it('renders without throwing', () => {
    expect(() => Cron(defaultProps)).not.toThrow()
  })

  it('renders 6 Field inputs (month, week, day, hour, minute, second)', () => {
    const fields = findFields(Cron(defaultProps))
    expect(fields).toHaveLength(6)
  })

  it('renders a field for each cron part', () => {
    const names = findFields(Cron(defaultProps)).map(f => f.props.name)
    expect(names).toContain('month')
    expect(names).toContain('week')
    expect(names).toContain('day')
    expect(names).toContain('hour')
    expect(names).toContain('minute')
    expect(names).toContain('second')
  })

  it('disables all fields when readOnly is true', () => {
    const fields = findFields(Cron({ ...defaultProps, readOnly: true }))
    fields.forEach(field => {
      expect(field.props.disabled).toBe(true)
    })
  })

  it('does not disable fields when readOnly is false', () => {
    const fields = findFields(Cron({ ...defaultProps, readOnly: false }))
    fields.forEach(field => {
      expect(field.props.disabled).toBe(false)
    })
  })

  it('adds is-invalid class when minute has an error and is touched', () => {
    const minuteField = findFields(
      Cron({
        ...defaultProps,
        errors: { minute: 'required' },
        touched: { minute: true }
      })
    ).find(f => f.props.name === 'minute')

    expect(minuteField.props.className).toContain('is-invalid')
  })

  it('does not add is-invalid class when field is not touched', () => {
    const minuteField = findFields(
      Cron({
        ...defaultProps,
        errors: { minute: 'required' },
        touched: { minute: false }
      })
    ).find(f => f.props.name === 'minute')

    expect(minuteField.props.className).not.toContain('is-invalid')
  })
})
