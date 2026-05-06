import { IsPercentageInput } from './percentage_input'

describe('IsPercentageInput', () => {
  it('accepts empty input while editing', () => {
    expect(IsPercentageInput('')).toBe(true)
  })

  it('accepts whole percentage values', () => {
    expect(IsPercentageInput('0')).toBe(true)
    expect(IsPercentageInput('99')).toBe(true)
    expect(IsPercentageInput('100')).toBe(true)
  })

  it('accepts decimal percentage values under 100', () => {
    expect(IsPercentageInput('0.5')).toBe(true)
    expect(IsPercentageInput('99.5')).toBe(true)
  })

  it('rejects non-numeric separators and out-of-range values', () => {
    expect(IsPercentageInput('99x5')).toBe(false)
    expect(IsPercentageInput('100.5')).toBe(false)
    expect(IsPercentageInput('101')).toBe(false)
    expect(IsPercentageInput('abc')).toBe(false)
  })
})
