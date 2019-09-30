import SettingsSchema from './settings_schema'

describe('Settings schema validation', () => {
  let settings = { }

  beforeEach(() => {
    settings = {
      name: 'Hallroom',
      interface: 'wlan0',
      address: '0.0.0.0:443',
      display: false,
      notification: false,
      capabilities: {
        dev_mode: false,
        dashboard: true
      },
      health_check: {
        enable: false,
        max_memory: 500,
        max_cpu: 2
      },
      https: true,
      pca9685: false,
      pprof: true,
      rpi_pwm_freq: 1400,
      pca9685_pwm_freq: 1500
    }
  })
  it('works', () => {
    expect.assertions(1)
    return SettingsSchema.isValid(settings).then(
      valid => expect(valid).toBe(true)
    )
  })
})
