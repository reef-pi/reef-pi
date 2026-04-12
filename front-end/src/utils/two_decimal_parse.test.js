import { TwoDecimalParse } from './two_decimal_parse'

describe('TwoDecimalParse', () => {
  it('formats to two decimal places', () => {
    expect(TwoDecimalParse(1.234)).toBe('1.23')
  })

  it('pads missing decimals', () => {
    expect(TwoDecimalParse(5)).toBe('5.00')
  })

  it('handles string numbers', () => {
    expect(TwoDecimalParse('3.14159')).toBe('3.14')
  })

  it('returns NaN for NaN input', () => {
    expect(TwoDecimalParse(NaN)).toBe('NaN')
  })

  it('handles zero', () => {
    expect(TwoDecimalParse(0)).toBe('0.00')
  })

  it('handles negative numbers', () => {
    expect(TwoDecimalParse(-1.5)).toBe('-1.50')
  })
})
