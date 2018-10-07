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
})
