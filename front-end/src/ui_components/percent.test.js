import React from 'react'
import Percent from './percent'

describe('Percent', () => {
  const renderInput = props => Percent(props)

  it('renders an input element', () => {
    const input = renderInput({ value: 50, onChange: () => {} })
    expect(input.type).toBe('input')
  })

  it('renders with type number', () => {
    const input = renderInput({ value: 50, onChange: () => {} })
    expect(input.props.type).toBe('number')
  })

  it('shows empty string when value is NaN', () => {
    const input = renderInput({ value: NaN, onChange: () => {} })
    expect(input.props.value).toBe('')
  })

  it('calls onChange with float value for valid input', () => {
    let received
    const onChange = e => { received = e.target.value }
    const input = renderInput({ value: 0, onChange, name: 'pct' })
    input.props.onChange({ target: { name: 'pct', value: '75' } })
    expect(received).toBe(75)
  })

  it('accepts 100 as a valid value', () => {
    let received
    const onChange = e => { received = e.target.value }
    const input = renderInput({ value: 0, onChange, name: 'pct' })
    input.props.onChange({ target: { name: 'pct', value: '100' } })
    expect(received).toBe(100)
  })

  it('does not call onChange for clearly invalid characters', () => {
    let called = false
    const onChange = () => { called = true }
    const input = renderInput({ value: 0, onChange, name: 'pct' })
    input.props.onChange({ target: { name: 'pct', value: 'abc' } })
    expect(called).toBe(false)
  })

  it('calls onChange with NaN for empty input', () => {
    let received
    const onChange = e => { received = e.target.value }
    const input = renderInput({ value: 0, onChange, name: 'pct' })
    input.props.onChange({ target: { name: 'pct', value: '' } })
    expect(Number.isNaN(received)).toBe(true)
  })

  it('accepts decimal values like 99.5', () => {
    let received
    const onChange = e => { received = e.target.value }
    const input = renderInput({ value: 0, onChange, name: 'pct' })
    input.props.onChange({ target: { name: 'pct', value: '99.5' } })
    expect(received).toBe(99.5)
  })
})
