import PhSchema from './ph_schema'

describe('PhValidation', () => {
  const buildProbe = overrides => ({
    name: 'name',
    enable: true,
    analog_input: '1',
    period: 60,
    notify: true,
    minAlert: 8.0,
    maxAlert: 8.6,
    control: '',
    chart: { ymin: 0, ymax: 100, color: '#000' },
    ...overrides
  })

  it('should be valid for alerts', () => {
    expect.assertions(1)
    return PhSchema.isValid(buildProbe()).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should be valid for no alerts', () => {
    expect.assertions(1)
    return PhSchema.isValid(buildProbe({
      notify: false,
      minAlert: 0,
      maxAlert: 0
    })).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should require threshold if controlling macros', () => {
    expect.assertions(1)
    return PhSchema.isValid(buildProbe({
      control: 'macro'
    })).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should be valid if controlling equipment with required settings', () => {
    expect.assertions(1)
    return PhSchema.isValid(buildProbe({
      control: 'equipment',
      lowerThreshold: 8,
      lowerFunction: '2',
      upperThreshold: 9,
      upperFunction: '5',
      hysteresis: 0.1
    })).then(
      valid => expect(valid).toBe(true)
    )
  })
})
