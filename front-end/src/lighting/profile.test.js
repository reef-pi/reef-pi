import React from 'react'
import { shallow } from 'enzyme'
import Profile from './profile'

const baseProps = {
  name: 'profile',
  readOnly: false,
  errors: {},
  touched: {},
  onChangeHandler: jest.fn()
}

describe('Profile', () => {
  it('renders fixed profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='fixed' value={{ value: 50, start: '08:00:00', end: '20:00:00' }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders diurnal profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='diurnal' value={{ start: '06:00:00', end: '20:00:00' }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders interval profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='interval' value={{ start: '08:00:00', end: '20:00:00', values: [10, 50] }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders random profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='random' value={{ start: '08:00:00', end: '20:00:00' }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders sine profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='sine' value={{ start: '08:00:00', end: '20:00:00' }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders lunar profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='lunar' value={{ start: '08:00:00', end: '20:00:00' }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders circadian profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='circadian' value={{ start: '06:00:00', end: '22:00:00', dawn_value: 10, noon_value: 80 }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders cyclic profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='cyclic' value={{ period: 60, phase_shift: 0 }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders lightning profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='lightning' value={{ start: '08:00:00', end: '20:00:00', frequency: 2, flash_slot: 1, intensity: 100 }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders solar profile', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='solar' value={{ latitude: 37.7, longitude: -122.4 }} />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders unknown profile type with fallback span', () => {
    const wrapper = shallow(
      <Profile {...baseProps} type='unknown_type' value={{}} />
    )
    expect(wrapper.text()).toContain('unknown_type')
  })

  it('calls onChangeHandler when child component calls handleConfigChange', () => {
    const handler = jest.fn()
    const wrapper = shallow(
      <Profile {...baseProps} type='fixed' value={{ value: 50, start: '08:00:00', end: '20:00:00' }} onChangeHandler={handler} />
    )
    // Trigger the onChangeHandler on the rendered Fixed child
    wrapper.prop('onChangeHandler')({ value: 75 })
    expect(handler).toHaveBeenCalledWith({
      target: { name: 'profile', value: { value: 75 } }
    })
  })
})
