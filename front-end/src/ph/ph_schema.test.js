import PhSchema from './ph_schema'

describe('PhValidation', () => {
  var probe = {}

  beforeEach(() => {
    probe = {
      name: 'name',
      enable: true,
      analog_input: '1',
      period: 60,
      notify: true,
      minAlert: 8.0,
      maxAlert: 8.6
    }
  })

  it('should be valid for alerts', () => {
    expect.assertions(1)
    return PhSchema.isValid(probe).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should be valid for no alerts', () => {
    probe.notify = false
    probe.minAlert = 0
    probe.maxAlert = 0

    expect.assertions(1)
    return PhSchema.isValid(probe).then(
      valid => expect(valid).toBe(true)
    )
  })
})
