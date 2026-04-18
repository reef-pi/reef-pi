import React from 'react'
import { shallow } from 'enzyme'
import SolarProfile from './solar_profile'

const baseProps = {
  name: 'profile',
  config: { latitude: 37.7, longitude: -122.4 },
  readOnly: false,
  onChangeHandler: jest.fn(),
  touched: {},
  errors: {}
}

describe('SolarProfile', () => {
  it('renders without throwing', () => {
    const wrapper = shallow(<SolarProfile {...baseProps} />)
    expect(wrapper).toBeDefined()
  })

  it('renders in readOnly mode', () => {
    const wrapper = shallow(<SolarProfile {...baseProps} readOnly />)
    expect(wrapper).toBeDefined()
  })

  it('renders with validation errors', () => {
    const wrapper = shallow(
      <SolarProfile
        {...baseProps}
        errors={{ 'profile.latitude': 'required' }}
        touched={{ 'profile.latitude': true }}
      />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders with no config', () => {
    const wrapper = shallow(<SolarProfile {...baseProps} config={undefined} />)
    expect(wrapper).toBeDefined()
  })
})
