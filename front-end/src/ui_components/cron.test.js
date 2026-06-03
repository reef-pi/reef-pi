import React from 'react'
import Cron from './cron'
import { Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const defaultProps = {
  values: { month: '*', week: '*', day: '*', hour: '*', minute: '*', second: '0' },
  errors: {},
  touched: {},
  handleChange: () => {},
  handleBlur: () => {}
}

const findInputs = (node, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  // Match design-system Input (forwardRef component)
  if (node.type === Input && node.props && node.props.name) {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => findInputs(child, acc))
  return acc
}

describe('Cron', () => {
  it('renders without throwing', () => {
    expect(() => Cron(defaultProps)).not.toThrow()
  })

  it('renders 6 Input controls (month, week, day, hour, minute, second)', () => {
    const inputs = findInputs(Cron(defaultProps))
    expect(inputs).toHaveLength(6)
  })

  it('renders an input for each cron part', () => {
    const names = findInputs(Cron(defaultProps)).map(f => f.props.name)
    expect(names).toContain('month')
    expect(names).toContain('week')
    expect(names).toContain('day')
    expect(names).toContain('hour')
    expect(names).toContain('minute')
    expect(names).toContain('second')
  })

  it('disables all inputs when readOnly is true', () => {
    const inputs = findInputs(Cron({ ...defaultProps, readOnly: true }))
    inputs.forEach(input => {
      expect(input.props.disabled).toBe(true)
    })
  })

  it('does not disable inputs when readOnly is false', () => {
    const inputs = findInputs(Cron({ ...defaultProps, readOnly: false }))
    inputs.forEach(input => {
      expect(input.props.disabled).toBe(false)
    })
  })

  it('sets invalid prop when minute has an error and is touched', () => {
    const minuteInput = findInputs(
      Cron({
        ...defaultProps,
        errors: { minute: 'required' },
        touched: { minute: true }
      })
    ).find(f => f.props.name === 'minute')

    expect(minuteInput.props.invalid).toBe(true)
  })

  it('does not set invalid prop when field is not touched', () => {
    const minuteInput = findInputs(
      Cron({
        ...defaultProps,
        errors: { minute: 'required' },
        touched: { minute: false }
      })
    ).find(f => f.props.name === 'minute')

    expect(minuteInput.props.invalid).toBeFalsy()
  })
})
