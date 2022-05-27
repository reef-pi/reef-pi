import DoserSchema from './doser_schema'

describe('DoserValidation', () => {
  let basicDoser = {}

  beforeEach(() => {
    basicDoser = {
      name: 'dosername',
      type: '',
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
      speed: 2,
      month: '1',
      week: '1',
      day: '1',
      hour: '1',
      minute: '1',
      second: '1',
    }
  })

  it('should be valid', () => {
    DoserSchema.validate(basicDoser, {abortEarly: false})
  })

  it('allows for some complicated invocations', () => {
    const doserUpdates = {
      month: 'SEP',
      week: '2',
      day: 'L',
      hour: '4',
      minute: '49',
      second: '0',
    }
    const repeatedDoser = { ...basicDoser, doserUpdates }
    DoserSchema.validate(repeatedDoser, {abortEarly: false})

    const doserUpdateWithW = { ...repeatedDoser, day: '12W' }
    DoserSchema.validate(doserUpdateWithW, {abortEarly: false})

    const doserUpdateWithMultiComplicated = { ...repeatedDoser,  day: '1,12W' }
    DoserSchema.validate(doserUpdateWithMultiComplicated, {abortEarly: false})
  })

  it('allows * for timings', () => {
    const doserUpdates = {
      month: '1',
      week: '1',
      day: '1',
      hour: '0',
      minute: '0',
      second: '0',
    }
    const repeatedDoser = { ...basicDoser, ...doserUpdates }

    DoserSchema.validate(repeatedDoser, {abortEarly: false})
  })

})
