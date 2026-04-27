import React from 'react'
import { shallow } from 'enzyme'
import EditFlowMeter from './edit_flow_meter'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

describe('<EditFlowMeter />', () => {
  const fn = jest.fn()
  const values = {
    name: 'test meter',
    enable: true,
    sensor: '/tmp/flow_pulse_count',
    pulses_per_liter: 450,
    period: 60,
    notify_enable: false,
    notify_min: 0
  }

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
    jest.spyOn(Alert, 'showUpdateSuccessful')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditFlowMeter /> should mount', () => {
    shallow(
      <EditFlowMeter
        values={values}
        errors={{}}
        touched={{}}
        submitForm={fn}
      />
    )
  })

  it('<EditFlowMeter /> should submit when valid', () => {
    const wrapper = shallow(
      <EditFlowMeter
        values={values}
        errors={{}}
        touched={{}}
        submitForm={fn}
        dirty
        isValid
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('<EditFlowMeter /> should show alert when invalid', () => {
    const wrapper = shallow(
      <EditFlowMeter
        values={values}
        errors={{}}
        touched={{}}
        submitForm={fn}
        dirty
        isValid={false}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditFlowMeter /> should show notify_min field when notify_enable is true', () => {
    const notifyValues = { ...values, notify_enable: true, notify_min: 5 }
    const wrapper = shallow(
      <EditFlowMeter
        values={notifyValues}
        errors={{}}
        touched={{}}
        submitForm={fn}
      />
    )
    expect(wrapper.find({ name: 'notify_min' }).exists()).toBe(true)
  })

  it('<EditFlowMeter /> should hide notify_min field when notify_enable is false', () => {
    const wrapper = shallow(
      <EditFlowMeter
        values={values}
        errors={{}}
        touched={{}}
        submitForm={fn}
      />
    )
    expect(wrapper.find({ name: 'notify_min' }).exists()).toBe(false)
  })
})
