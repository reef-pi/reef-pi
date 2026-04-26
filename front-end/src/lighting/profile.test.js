import React from 'react'
import Profile from './profile'
import Fixed from './fixed_profile'
import Diurnal from './diurnal_profile'
import Auto from './auto_profile'
import Random from './random_profile'
import Lunar from './lunar_profile'
import Sine from './sine_profile'
import Circadian from './circadian_profile'
import Cyclic from './cyclic_profile'
import Lightning from './lightning_profile'
import Solar from './solar_profile'

const baseProps = {
  name: 'profile',
  readOnly: false,
  errors: {},
  touched: {},
  onChangeHandler: jest.fn()
}

describe('Profile', () => {
  it('renders fixed profile', () => {
    expect(Profile({ ...baseProps, type: 'fixed', value: { value: 50, start: '08:00:00', end: '20:00:00' } }).type).toBe(Fixed)
  })

  it('renders diurnal profile', () => {
    expect(Profile({ ...baseProps, type: 'diurnal', value: { start: '06:00:00', end: '20:00:00' } }).type).toBe(Diurnal)
  })

  it('renders interval profile', () => {
    expect(Profile({ ...baseProps, type: 'interval', value: { start: '08:00:00', end: '20:00:00', values: [10, 50] } }).type).toBe(Auto)
  })

  it('renders random profile', () => {
    expect(Profile({ ...baseProps, type: 'random', value: { start: '08:00:00', end: '20:00:00' } }).type).toBe(Random)
  })

  it('renders sine profile', () => {
    expect(Profile({ ...baseProps, type: 'sine', value: { start: '08:00:00', end: '20:00:00' } }).type).toBe(Sine)
  })

  it('renders lunar profile', () => {
    expect(Profile({ ...baseProps, type: 'lunar', value: { start: '08:00:00', end: '20:00:00' } }).type).toBe(Lunar)
  })

  it('renders circadian profile', () => {
    expect(Profile({ ...baseProps, type: 'circadian', value: { start: '06:00:00', end: '22:00:00', dawn_value: 10, noon_value: 80 } }).type).toBe(Circadian)
  })

  it('renders cyclic profile', () => {
    expect(Profile({ ...baseProps, type: 'cyclic', value: { period: 60, phase_shift: 0 } }).type).toBe(Cyclic)
  })

  it('renders lightning profile', () => {
    expect(Profile({ ...baseProps, type: 'lightning', value: { start: '08:00:00', end: '20:00:00', frequency: 2, flash_slot: 1, intensity: 100 } }).type).toBe(Lightning)
  })

  it('renders solar profile', () => {
    expect(Profile({ ...baseProps, type: 'solar', value: { latitude: 37.7, longitude: -122.4 } }).type).toBe(Solar)
  })

  it('renders unknown profile type with fallback span', () => {
    const fallback = Profile({ ...baseProps, type: 'unknown_type', value: {} })
    expect(fallback.type).toBe('span')
    expect(String(fallback.props.children[1])).toContain('unknown_type')
  })

  it('calls onChangeHandler when child component calls handleConfigChange', () => {
    const handler = jest.fn()
    const profile = Profile({
      ...baseProps,
      type: 'fixed',
      value: { value: 50, start: '08:00:00', end: '20:00:00' },
      onChangeHandler: handler
    })

    profile.props.onChangeHandler({ value: 75 })
    expect(handler).toHaveBeenCalledWith({
      target: { name: 'profile', value: { value: 75 } }
    })
  })
})
