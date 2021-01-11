import PhSchema from './ph_schema'
import { powerSaveBlocker } from 'electron'

describe('PhValidation', () => {
  let probe = {}

  // *** added chart_y_min, chart_y_max - JFR 20201111
  // *** removed above after upstream change - JFR 20210111
  beforeEach(() => {
    probe = {
      name: 'name',
      enable: true,
      analog_input: '1',
      period: 60,
      notify: true,
      minAlert: 8.0,
      maxAlert: 8.6,
      control: 'nothing',
      chart: {ymin:0, ymax:100, color: '#000'}
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

  it('should require threshold if controlling macros', () => {
    probe.control = 'macro'
    expect.assertions(1)
    return PhSchema.isValid(probe).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should be valid if controlling equipment with required settings', () => {
    probe.control = 'equipment'
    probe.lowerThreshold = 8
    probe.lowerFunction = '2'
    probe.upperThreshold = 9
    probe.upperFunction = '5'
    probe.hysteresis = 0.1

    expect.assertions(1)
    return PhSchema.isValid(probe).then(
      valid => expect(valid).toBe(true)
    )
  })
})
