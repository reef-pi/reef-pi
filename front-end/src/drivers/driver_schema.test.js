import DriverSchema from './driver_schema'

describe('Validation', () => {
  let driver = {}
  beforeEach(() => {
    driver = {
      name: 'foo',
      type: 'pca9685',
      config: {}
    }
  })

  it('should require type to be pca9685', () => {
    expect.assertions(1)
    return DriverSchema.isValid(driver).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('accepts zero for numeric config fields (e.g. ESP32 unused pin counts)', () => {
    driver.type = 'esp32'
    driver.config = {
      address: '192.168.4.1',
      digitaloutput: '0',
      digitalinput: '0',
      pwm: '4',
      analoginput: '1'
    }
    expect.assertions(1)
    return DriverSchema.isValid(driver).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('rejects negative values for numeric config fields', () => {
    driver.type = 'esp32'
    driver.config = {
      address: '192.168.4.1',
      digitaloutput: '-1',
      digitalinput: '0',
      pwm: '0',
      analoginput: '0'
    }
    expect.assertions(1)
    return DriverSchema.isValid(driver).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('rejects empty string for required string config fields', () => {
    driver.type = 'esp32'
    driver.config = {
      address: '',
      digitaloutput: '6',
      digitalinput: '4',
      pwm: '4',
      analoginput: '2'
    }
    expect.assertions(1)
    return DriverSchema.isValid(driver).then(
      valid => expect(valid).toBe(false)
    )
  })
})
