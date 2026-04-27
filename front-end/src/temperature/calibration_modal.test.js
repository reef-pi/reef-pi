import React from 'react'
import { shallow } from 'enzyme'
import { CalibrationForm, mapCalibrationPropsToValues, submitCalibrationForm } from './calibration_modal'
import 'isomorphic-fetch'

describe('Temperature CalibrationModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  const makeProps = (overrides = {}) => ({
    probe: { id: '1', name: 'Water Temp' },
    readProbe: jest.fn(),
    currentReading: { 1: 25.5 },
    cancel: jest.fn(),
    handleSubmit: jest.fn(),
    errors: {},
    touched: {},
    ...overrides
  })

  it('<CalibrationForm /> renders', () => {
    const wrapper = shallow(<CalibrationForm {...makeProps()} />)
    expect(wrapper).toBeDefined()
    wrapper.instance().componentWillUnmount()
  })

  it('componentDidMount polls readProbe every 500ms', () => {
    const readProbe = jest.fn()
    const wrapper = shallow(<CalibrationForm {...makeProps({ readProbe })} />)
    jest.advanceTimersByTime(500)
    expect(readProbe).toHaveBeenCalledWith('1')
    wrapper.instance().componentWillUnmount()
  })

  it('componentWillUnmount clears interval', () => {
    const readProbe = jest.fn()
    const wrapper = shallow(<CalibrationForm {...makeProps({ readProbe })} />)
    wrapper.instance().componentWillUnmount()
    jest.advanceTimersByTime(1000)
    expect(readProbe).not.toHaveBeenCalled()
  })

  it('handleCancel calls props.cancel', () => {
    const cancel = jest.fn()
    const wrapper = shallow(<CalibrationForm {...makeProps({ cancel })} />)
    wrapper.instance().handleCancel()
    expect(cancel).toHaveBeenCalled()
    wrapper.instance().componentWillUnmount()
  })

  it('mapCalibrationPropsToValues uses defaultValue when provided', () => {
    const values = mapCalibrationPropsToValues({ probe: { id: '1' }, defaultValue: 26.0, currentReading: { 1: 25.5 } })
    expect(values.value).toBe(26.0)
  })

  it('mapCalibrationPropsToValues falls back to currentReading', () => {
    const values = mapCalibrationPropsToValues({ probe: { id: '1' }, currentReading: { 1: 25.5 } })
    expect(values.value).toBe(25.5)
  })

  it('submitCalibrationForm calls onSubmit with parsed float', () => {
    const onSubmit = jest.fn()
    const probe = { id: '1', name: 'Water Temp' }
    submitCalibrationForm({ value: '26.7' }, { probe, onSubmit })
    expect(onSubmit).toHaveBeenCalledWith(probe, 26.7)
  })
})
