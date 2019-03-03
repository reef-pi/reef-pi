import DriverSchema from './driver_schema'

describe('Validation', () => {
  var driver = {}
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
})
