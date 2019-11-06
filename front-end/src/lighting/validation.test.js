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
          start_min: 0,
          pin: 9,
          reverse: false,
          profile: { }
        }
      }
    }
  }

  it('should validate fixed when valid', () => {
    value.config.channels['1'].profile = {
      type: 'fixed',
      config: {
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
        value: null
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should validate auto when valid', () => {
    value.config.channels['1'].profile = {
      type: 'auto',
      config: {
        values: [0, 0, 0, 50, 0, 0, 0, 0, 0]
      }
    }
    expect.assertions(1)
    return LightSchema.isValid(value).then(
      valid => expect(valid).toBe(true)
    )
  })

  it('should validate auto when invalid', () => {
    value.config.channels['1'].profile = {
      type: 'auto',
      config: {
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
})
