import TemperatureSchema from './temperature_schema'

describe('Validation', () => {
  var tc = {
    name: 'name',
    sensor: 'sensor',
    enabled: true,
    fahrenheit: true,
    period: 60,
    alerts: false,
    notify: {enable: false},
    heater: '',
    cooler: ''
  }

  beforeEach(() => {
    tc = {
      name: 'name',
      sensor: 'sensor',
      enabled: true,
      fahrenheit: true,
      period: 60,
      alerts: false,
      notify: {enable: false},
      heater: '',
      cooler: ''
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

  /*
  it('should validate fixed when invalid', () => {
    value.config.channels['1'].profile = {
      type: 'fixed',
      config: {
        value: null
      }
    }
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should validate auto when valid', () => {
    value.config.channels['1'].profile = {
      type: 'auto',
      config: {
        values: [0, 0, 0, 50, 0, 0, 0, 0, 0]
      }
    }
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should validate auto when invalid', () => {
    value.config.channels['1'].profile = {
      type: 'auto',
      config: {
        values: null
      }
    }
    expect.assertions(1)
    return TemperatureSchema.isValid(tc).then(
      valid => expect(valid).toBe(false)
    )
  })
  */
})
