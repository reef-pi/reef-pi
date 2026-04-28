import React from 'react'
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
    const wrapper = new CalibrationForm(makeProps())
    expect(React.isValidElement(wrapper.render())).toBe(true)
    wrapper.componentWillUnmount()
  })

  it('componentDidMount polls readProbe every 500ms', () => {
    const readProbe = jest.fn()
    const wrapper = new CalibrationForm(makeProps({ readProbe }))
    wrapper.componentDidMount()
    jest.advanceTimersByTime(500)
    expect(readProbe).toHaveBeenCalledWith('1')
    wrapper.componentWillUnmount()
  })

  it('componentWillUnmount clears interval', () => {
    const readProbe = jest.fn()
    const wrapper = new CalibrationForm(makeProps({ readProbe }))
    wrapper.componentDidMount()
    wrapper.componentWillUnmount()
    jest.advanceTimersByTime(1000)
    expect(readProbe).not.toHaveBeenCalled()
  })

  it('handleCancel calls props.cancel', () => {
    const cancel = jest.fn()
    const wrapper = new CalibrationForm(makeProps({ cancel }))
    wrapper.handleCancel()
    expect(cancel).toHaveBeenCalled()
    wrapper.componentWillUnmount()
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
