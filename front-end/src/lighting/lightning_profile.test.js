import React from 'react'
import { shallow } from 'enzyme'
import LightningProfile from './lightning_profile'

describe('LightningProfile', () => {
  const config = {
    start: '08:00:00',
    end: '20:00:00',
    frequency: 2,
    flash_slot: 1,
    intensity: 100
  }

  it('renders without throwing with full config', () => {
    const handler = jest.fn()
    const wrapper = shallow(
      <LightningProfile
        config={config}
        errors={{}}
        touched={{}}
        readOnly={false}
        onChangeHandler={handler}
      />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders without throwing with no config (uses fallback defaults)', () => {
    const handler = jest.fn()
    const wrapper = shallow(
      <LightningProfile
        config={undefined}
        errors={{}}
        touched={{}}
        readOnly={false}
        onChangeHandler={handler}
      />
    )
    expect(wrapper).toBeDefined()
  })

  it('calls onChangeHandler with merged config on field change', () => {
    const handler = jest.fn()
    const wrapper = shallow(
      <LightningProfile
        config={config}
        errors={{}}
        touched={{}}
        readOnly={false}
        onChangeHandler={handler}
      />
    )
    // Simulate a change on the start Field (use 'Field' tag to avoid matching ErrorFor with same name prop)
    wrapper.find('Field[name="config.start"]').simulate('change', {
      target: { name: 'start', value: '09:00:00' }
    })
    expect(handler).toHaveBeenCalledWith({ ...config, start: '09:00:00' })
  })

  it('renders in readOnly mode without throwing', () => {
    const wrapper = shallow(
      <LightningProfile
        config={config}
        errors={{}}
        touched={{}}
        readOnly
        onChangeHandler={() => {}}
      />
    )
    expect(wrapper).toBeDefined()
  })

  it('renders with validation errors applied', () => {
    const wrapper = shallow(
      <LightningProfile
        config={config}
        errors={{ 'config.start': 'required' }}
        touched={{ 'config.start': true }}
        readOnly={false}
        onChangeHandler={() => {}}
      />
    )
    expect(wrapper).toBeDefined()
  })
})
