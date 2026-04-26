import React from 'react'
import CalibrateForm, {
  Calibrate,
  mapCalibrationPropsToValues,
  submitCalibrationForm
} from './calibrate'
import CalibrationWizard from './calibration_wizard'
import 'isomorphic-fetch'

describe('Ph Calibration', () => {
  const values = { enable: true }
  const fn = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<Calibrate /> renders a form', () => {
    const element = Calibrate({
      values,
      errors: {},
      touched: {},
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn
    })

    expect(element.type).toBe('form')
  })

  it('<Calibrate /> should submit', () => {
    const submitForm = jest.fn()
    const element = Calibrate({
      values,
      handleBlur: fn,
      handleChange: fn,
      submitForm,
      errors: {},
      touched: {},
      dirty: true,
      isValid: true
    })

    element.props.onSubmit({ preventDefault: jest.fn() })
    expect(submitForm).toHaveBeenCalled()
  })

  it('<CalibrateForm/> maps and submits values', () => {
    expect(mapCalibrationPropsToValues({ defaultValue: 7 })).toEqual({ value: 7 })

    const onSubmit = jest.fn()
    submitCalibrationForm({ value: '8.4' }, { onSubmit, point: 'mid' })
    expect(onSubmit).toHaveBeenCalledWith('mid', 8.4)
    expect(CalibrateForm).toBeDefined()
  })

  it('<CalibrationWizard />', () => {
    const calibrateProbe = jest.fn(() => Promise.resolve(true))
    const probe = { id: 1 }
    const wrapper = new CalibrationWizard(
      {
        probe,
        currentReading: [8.7, 9.0, 7.5],
        cancel: fn,
        confirm: fn,
        calibrateProbe
      }
    )
    wrapper.setState = jest.fn()

    wrapper.handleCalibrate('mid', 7)
    wrapper.handleCalibrate('second', 10)
    wrapper.handleCalibrate('low', 4)

    expect(calibrateProbe).toHaveBeenCalledWith(1, { type: 'mid', expected: 7, observed: 9 })
    expect(calibrateProbe).toHaveBeenCalledWith(1, { type: 'second', expected: 10, observed: 9 })
    expect(calibrateProbe).toHaveBeenCalledWith(1, { type: 'low', expected: 4, observed: 9 })
  })
})
