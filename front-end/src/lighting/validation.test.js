import LightSchema from './light_schema'

describe('Validation', () => {
  const value = {
    config: {
      name: 'testing',
      channels: {
        1: {
          name: 'Channel 1',
          color: '',
          min: 0,
          max: 100,
          pin: 9,
          profile: { }
        }
      }
    }
  }

  it('should validate fixed when valid', () => {
    value.config.channels['1'].profile = {
      type: 'fixed',
      config: {
        start: '14:00',
        end: '20:00',
        value: 50
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should validate fixed when invalid', () => {
    value.config.channels['1'].profile = {
      type: 'fixed',
      config: {
        start: '',
        end: '',
        value: null
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should validate interval when valid', () => {
    value.config.channels['1'].profile = {
      type: 'interval',
      config: {
        start: '14:00',
        end: '20:00',
        values: [0, 0, 0, 50, 0, 0, 0, 0, 0]
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should validate interval when invalid', () => {
    value.config.channels['1'].profile = {
      type: 'interval',
      config: {
        start: '',
        end: '',
        values: null
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should validate diurnal when valid', () => {
    value.config.channels['1'].profile = {
      type: 'diurnal',
      config: {
        start: '11:00',
        end: '19:00'
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should validate diurnal when invalid', () => {
    value.config.channels['1'].profile = {
      type: 'diurnal',
      config: {
        start: '',
        end: '19:00'
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require a profile type', () => {
    value.config.channels['1'].profile.type = ''
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(false)
    )
  })
})
