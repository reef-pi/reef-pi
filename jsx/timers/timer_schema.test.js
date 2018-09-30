import TimerSchema from './timer_schema'

describe('TimerValidation', () => {
  var timer = {}

  beforeEach(() => {
    timer = {
      name: 'name',
      enable: true,
      day: '*',
      hour: '*',
      minute: '*',
      second: '0',
      type: 'equipment',
      equipment_id: '2',
      on: true,
      duration: 60,
      revert: false,
      title: '',
      message: ''
    }
  })

  it('should be valid for equipment', () => {
    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should be valid for reminder', () => {
    timer.type = 'reminder'
    timer.title = 'title'
    timer.message = 'message'
    timer.equipment_id = ''

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should require message for reminder', () => {
    timer.type = 'reminder'
    timer.title = 'title'
    timer.message = ''

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require equipment_id for equipment', () => {
    timer.equipment_id = ''

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require duration for equipment with rever', () => {
    timer.revert = true
    timer.duration = ''

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })

  /*
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
  */
})
