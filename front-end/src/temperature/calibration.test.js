import React from 'react'
import {
  CalibrationForm,
  mapCalibrationPropsToValues,
  submitCalibrationForm
} from './calibration_modal'
import 'isomorphic-fetch'

describe('Temperature Calibration', () => {
  const values = { enable: true }
  const probe = {
    id: 1,
    name: 'probe'
  }
  const currentReading = [77, 76]
  const fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(window, 'setInterval').mockReturnValue(123)
    jest.spyOn(window, 'clearInterval').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('maps modal props into default form values', () => {
    expect(
      mapCalibrationPropsToValues({
        probe,
        currentReading,
        defaultValue: 77
      })
    ).toEqual({ value: 77 })

    expect(
      mapCalibrationPropsToValues({
        probe,
        currentReading
      })
    ).toEqual({ value: currentReading[probe.id] })
  })

  it('submits parsed calibration values', () => {
    const onSubmit = jest.fn()

    submitCalibrationForm({ value: '77.5' }, { onSubmit, probe })

    expect(onSubmit).toHaveBeenCalledWith(probe, 77.5)
  })

  it('renders the calibration form and wires submit', () => {
    const handleSubmit = jest.fn()
    const form = new CalibrationForm({
      values,
      probe,
      currentReading,
      defaultValue: 77,
      readProbe: fn,
      calibrateProbe: fn,
      cancel: fn,
      handleSubmit,
      touched: {},
      errors: {}
    })

    const element = form.render()
    const renderedForm = element.props.children

    expect(renderedForm.type).toBe('form')

    renderedForm.props.onSubmit({})
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('cancels calibration', () => {
    const cancel = jest.fn()
    const form = new CalibrationForm({
      values,
      probe,
      currentReading,
      defaultValue: 77,
      readProbe: fn,
      calibrateProbe: fn,
      cancel,
      handleSubmit: fn,
      touched: {},
      errors: {}
    })

    form.handleCancel()

    expect(cancel).toHaveBeenCalled()
  })

  it('starts and stops polling readings', () => {
    const readProbe = jest.fn()
    jest.useFakeTimers()
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval')

    const form = new CalibrationForm({
      values,
      probe,
      currentReading,
      defaultValue: 77,
      readProbe,
      calibrateProbe: fn,
      cancel: fn,
      handleSubmit: fn,
      touched: {},
      errors: {}
    })

    form.componentDidMount()
    jest.runOnlyPendingTimers()
    expect(readProbe).toHaveBeenCalledWith(probe.id)

    form.componentWillUnmount()
    expect(clearIntervalSpy).toHaveBeenCalledWith(form.timer)
    jest.useRealTimers()
  })
})
