import TemperatureSchema from './temperature_schema'

describe('Validation', () => {
  let tc = {}

  // *** added chart_y_min, chart_y_max - JFR 20201110
  // *** removed above after upstream change - JFR 20210111
  beforeEach(() => {
    tc = {
      name: 'name',
      sensor: 'sensor',
      enable: true,
      fahrenheit: true,
      period: 60,
      alerts: false,
      notify: { enable: false },
      heater: '',
      cooler: '',
      chart: {ymin: 0, ymax: 100, color: '#000'}
    }
  })

  it('should require min and max alert when alert is enabled', () => {
    tc.alerts = true
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require min and max alert when alert is enabled', () => {
    tc.alerts = true
    tc.minAlert = 77
    tc.maxAlert = 81
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should be valid when heater and cooler to be different and have min/max', () => {
    tc.heater = '2'
    tc.cooler = '4'
    tc.min = 77
    tc.max = 80
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should be invalid when heater and cooler are the same', () => {
    tc.heater = '2'
    tc.cooler = '2'
    tc.min = 77
    tc.max = 80
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require min when a heater is selected', () => {
    tc.heater = '2'
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require max when a chiller is selected', () => {
    tc.cooler = '2'
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(false)
    )
  })
})
