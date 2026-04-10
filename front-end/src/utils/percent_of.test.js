import { PercentOf } from './percent_of'

describe('PercentOf', () => {
  it('calculates percentage correctly', () => {
    expect(PercentOf(50, 100)).toBe('50')
  })

  it('rounds to whole number', () => {
    expect(PercentOf(1, 3)).toBe('33')
  })

  it('handles 100%', () => {
    expect(PercentOf(100, 100)).toBe('100')
  })

  it('handles 0%', () => {
    expect(PercentOf(0, 100)).toBe('0')
  })

  it('returns NaN for NaN input', () => {
    expect(PercentOf(NaN, 100)).toBe('NaN')
  })

  it('handles float values', () => {
    expect(PercentOf(1.5, 10)).toBe('15')
  })
})
