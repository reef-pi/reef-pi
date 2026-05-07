import LightSchema from './light_schema'

const validChannel = (profileType, config) => ({
  name: 'Blue LED',
  min: 0,
  max: 100,
  profile: { type: profileType, config }
})

const validLight = (channel) => ({
  config: {
    name: 'Main Reef',
    channels: { 1: channel }
  }
})

describe('LightSchema', () => {
  it('validates a fixed profile', () => {
    const ch = validChannel('fixed', { value: 50, start: '08:00:00', end: '20:00:00' })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('accepts a channel without color', () => {
    const ch = validChannel('fixed', { value: 50, start: '08:00:00', end: '20:00:00' })
    expect(ch.color).toBeUndefined()
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('validates a diurnal profile', () => {
    const ch = validChannel('diurnal', { start: '06:00:00', end: '20:00:00' })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('validates an interval (auto) profile', () => {
    const ch = validChannel('interval', {
      start: '08:00:00',
      end: '20:00:00',
      values: [10, 50, 90]
    })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('validates a sine profile', () => {
    const ch = validChannel('sine', { start: '08:00:00', end: '20:00:00' })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('validates a random profile', () => {
    const ch = validChannel('random', { start: '08:00:00', end: '20:00:00' })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('rejects missing light name', () => {
    const ch = validChannel('fixed', { value: 50, start: '08:00:00', end: '20:00:00' })
    const light = { config: { name: '', channels: { 1: ch } } }
    return expect(LightSchema.isValid(light)).resolves.toBe(false)
  })

  it('rejects channel min above 100', () => {
    const ch = validChannel('fixed', { value: 50, start: '08:00:00', end: '20:00:00' })
    ch.min = 150
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(false)
  })

  it('rejects channel with missing name', () => {
    const ch = validChannel('fixed', { value: 50, start: '08:00:00', end: '20:00:00' })
    ch.name = ''
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(false)
  })

  it('validates a solar profile', () => {
    const ch = validChannel('solar', { latitude: 37.7, longitude: -122.4 })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('rejects solar profile with latitude out of range', () => {
    const ch = validChannel('solar', { latitude: 91, longitude: 0 })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(false)
  })

  it('validates a lightning profile', () => {
    const ch = validChannel('lightning', {
      start: '08:00:00',
      end: '20:00:00',
      frequency: 2,
      flash_slot: 1,
      intensity: 100
    })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('rejects lightning profile missing required fields', () => {
    const ch = validChannel('lightning', { start: '08:00:00' })
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(false)
  })

  it('uses default (unknown type) profile schema — accepts when type string is present', () => {
    const ch = validChannel('unknown', {})
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(true)
  })

  it('uses default profile schema — rejects when type is empty', () => {
    const ch = validChannel('', {})
    return expect(LightSchema.isValid(validLight(ch))).resolves.toBe(false)
  })
})
