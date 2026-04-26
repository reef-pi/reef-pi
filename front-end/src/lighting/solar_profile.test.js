import React from 'react'
import SolarProfile from './solar_profile'

const baseProps = {
  name: 'profile',
  config: { latitude: 37.7, longitude: -122.4 },
  readOnly: false,
  onChangeHandler: jest.fn(),
  touched: {},
  errors: {}
}

const findFields = (node, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (node.type && node.type.name === 'Field') {
    acc.push(node)
  }
  React.Children.toArray(node.props?.children).forEach(child => findFields(child, acc))
  return acc
}

describe('SolarProfile', () => {
  it('renders without throwing', () => {
    expect(() => SolarProfile(baseProps)).not.toThrow()
  })

  it('renders in readOnly mode', () => {
    const fields = findFields(SolarProfile({ ...baseProps, readOnly: true }))
    fields.forEach(field => {
      expect(field.props.disabled).toBe(true)
    })
  })

  it('renders with validation errors', () => {
    const fields = findFields(
      SolarProfile({
        ...baseProps,
        errors: { 'profile.latitude': 'required' },
        touched: { 'profile.latitude': true }
      })
    )
    expect(fields.find(field => field.props.name === 'profile.latitude')).toBeTruthy()
  })

  it('renders with no config', () => {
    expect(() => SolarProfile({ ...baseProps, config: undefined })).not.toThrow()
  })
})
