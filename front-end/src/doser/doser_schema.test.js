import DoserSchema from './doser_schema'

describe('DoserValidation', () => {
  let basicDoser = {}

  beforeEach(() => {
    basicDoser = {
      name: 'dosername',
      type: 'dcpump',
      jack: '',
      pin: '',

      stepper: {
        direction_pin: '',
        step_pin: '',
        ms_pin_a: '',
        ms_pin_b: '',
        ms_pin_c: '',
        spr: 1,
        delay: 1,
        vpr: 1,
        direction: true,
        microstepping: ''
      },
      enable: true,
      continuous: false,
      duration: 1,
      speed: 2,
      month: '1',
      week: '1',
      day: '1',
      hour: '1',
      minute: '1',
      second: '1'
    }
  })

  it('should be valid', () => {
    return DoserSchema.validate(basicDoser, { abortEarly: false })
  })

  it('allows for some complicated invocations', () => {
    const doserUpdates = {
      month: 'SEP',
      week: '2',
      day: 'L',
      hour: '4',
      minute: '49',
      second: '0'
    }
    const repeatedDoser = { ...basicDoser, doserUpdates }
    DoserSchema.validate(repeatedDoser, { abortEarly: false })

    const doserUpdateWithW = { ...repeatedDoser, day: '12W' }
    DoserSchema.validate(doserUpdateWithW, { abortEarly: false })

    const doserUpdateWithMultiComplicated = { ...repeatedDoser, day: '1,12W' }
    DoserSchema.validate(doserUpdateWithMultiComplicated, { abortEarly: false })
  })

  it('allows * for timings', () => {
    const doserUpdates = {
      month: '1',
      week: '1',
      day: '1',
      hour: '0',
      minute: '0',
      second: '0'
    }
    const repeatedDoser = { ...basicDoser, ...doserUpdates }

    DoserSchema.validate(repeatedDoser, { abortEarly: false })
  })

  it('allows */N interval notation (regression #1978)', () => {
    expect.assertions(1)
    const doser = {
      ...basicDoser,
      minute: '*/15',
      second: '0',
      hour: '*',
      day: '*',
      month: '*',
      week: '*'
    }
    return DoserSchema.isValid(doser).then(valid => expect(valid).toBe(true))
  })

  it('requires cron fields for scheduled dosers', () => {
    expect.assertions(1)
    const doser = {
      ...basicDoser,
      continuous: false,
      month: '',
      week: '',
      day: '',
      hour: '',
      minute: '',
      second: ''
    }
    return DoserSchema.validate(doser, { abortEarly: false })
      .catch(err => expect(err.inner.map(e => e.path)).toEqual(expect.arrayContaining([
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second'
      ])))
  })

  it('allows continuous dosers without cron fields', () => {
    expect.assertions(1)
    const doser = {
      ...basicDoser,
      continuous: true,
      month: '',
      week: '',
      day: '',
      hour: '',
      minute: '',
      second: ''
    }
    return DoserSchema.isValid(doser).then(valid => expect(valid).toBe(true))
  })

  it('rejects invalid numeric dosing limits', () => {
    expect.assertions(1)
    const doser = {
      ...basicDoser,
      continuous: false,
      soft_start: -1,
      duration: 0,
      speed: 101
    }
    return DoserSchema.validate(doser, { abortEarly: false })
      .catch(err => expect(err.inner.map(e => e.path)).toEqual(expect.arrayContaining([
        'soft_start',
        'duration',
        'speed'
      ])))
  })

  it('allows a stepper doser without dc pump duration and speed', () => {
    expect.assertions(1)
    const doser = {
      ...basicDoser,
      type: 'stepper',
      volume: 5,
      duration: 0,
      speed: 0,
      stepper: {
        direction_pin: '2',
        step_pin: '1',
        ms_pin_a: '3',
        ms_pin_b: '4',
        ms_pin_c: '5',
        spr: 200,
        delay: 1000,
        vpr: 1.5,
        direction: true,
        microstepping: 'Full'
      }
    }
    return DoserSchema.isValid(doser).then(valid => expect(valid).toBe(true))
  })

})
