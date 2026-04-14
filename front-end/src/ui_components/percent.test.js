import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Percent from './percent'

describe('Percent', () => {
  const noop = () => {}

  it('renders an input element', () => {
    const html = renderToStaticMarkup(<Percent value={50} onChange={noop} />)
    expect(html).toContain('<input')
  })

  it('renders with type number', () => {
    const element = Percent({ value: 50, onChange: noop })
    expect(element.props.type).toBe('number')
  })

  it('shows empty string when value is NaN', () => {
    const element = Percent({ value: NaN, onChange: noop })
    expect(element.props.value).toBe('')
  })

  it('calls onChange with float value for valid input', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const element = Percent({ value: 0, onChange, name: 'pct' })
    element.props.onChange({ target: { name: 'pct', value: '75' } })
    expect(received).toBe(75)
  })

  it('accepts 100 as a valid value', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const element = Percent({ value: 0, onChange, name: 'pct' })
    element.props.onChange({ target: { name: 'pct', value: '100' } })
    expect(received).toBe(100)
  })

  it('does not call onChange for invalid characters', () => {
    let called = false
    const onChange = () => { called = true }
    const element = Percent({ value: 0, onChange, name: 'pct' })
    element.props.onChange({ target: { name: 'pct', value: 'abc' } })
    expect(called).toBe(false)
  })

  it('calls onChange with NaN for empty input', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const element = Percent({ value: 0, onChange, name: 'pct' })
    element.props.onChange({ target: { name: 'pct', value: '' } })
    expect(Number.isNaN(received)).toBe(true)
  })

  it('accepts decimal values like 99.5', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const element = Percent({ value: 0, onChange, name: 'pct' })
    element.props.onChange({ target: { name: 'pct', value: '99.5' } })
    expect(received).toBe(99.5)
  })
})
