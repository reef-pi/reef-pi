import TimerSchema from './timer_schema'

describe('TimerValidation', () => {
  let timer = {}

  beforeEach(() => {
    timer = {
      name: 'name',
      enable: true,
      type: 'equipment',
      day: '*',
      hour: '*',
      minute: '*',
      second: '0',
      month: '*',
      week: '*',
      target: {
        id: '2',
        on: true,
        duration: 60,
        revert: false
      }
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
    timer.target.title = 'title'
    timer.target.message = 'message'

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should require message for reminder', () => {
    timer.type = 'reminder'
    timer.target.title = 'title'
    timer.target.message = null

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require equipment_id for equipment', () => {
    timer.target.id = ''
    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require duration for equipment with revert', () => {
    timer.target.revert = true
    timer.target.duration = ''

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require a macro for macro', () => {
    timer.type = 'macro'
    timer.target.id = null

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require a target type', () => {
    timer.type = null

    expect.assertions(1)
    return TimerSchema.isValid(timer).then(
      valid => expect(valid).toBe(false)
    )
  })
})
