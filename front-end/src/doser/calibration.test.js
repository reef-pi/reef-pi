import React from 'react'
import CalibrateForm, {
  Calibrate,
  mapCalibratePropsToValues,
  submitCalibration
} from './calibrate'
import CalibrationModal from './calibration_modal'
import 'isomorphic-fetch'

describe('Doser Calibration', () => {
  const values = { enable: true, pumpType: 'dp' }
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
      errors: {},
      touched: {},
      handleBlur: fn,
      handleChange: fn,
      submitForm,
      dirty: true,
      isValid: true
    })

    element.props.onSubmit({ preventDefault: jest.fn() })
    expect(submitForm).toHaveBeenCalled()
  })

  it('<CalibrateForm/> maps and submits values', () => {
    expect(
      mapCalibratePropsToValues({
        duration: '15',
        speed: '100',
        volume: '5',
        pumpType: 'stepper'
      })
    ).toEqual({
      duration: '15',
      speed: '100',
      volume: '5',
      pumpType: 'stepper'
    })

    const onSubmit = jest.fn()
    submitCalibration(
      { duration: '15', speed: '100', volume: '5' },
      { onSubmit }
    )
    expect(onSubmit).toHaveBeenCalledWith(15, 100, 5)

    expect(CalibrateForm).toBeDefined()
  })

  it('<CalibrationWizard />', () => {
    const calibrateDoser = jest.fn(() => Promise.resolve(true))
    const saveCalibration = jest.fn()
    const doser = {
      id: 1,
      type: 'dp',
      regiment: { speed: 100, duration: 15, volume_per_second: 0 }
    }
    const wrapper = new CalibrationModal({
      doser,
      calibrateDoser,
      saveCalibration
    })

    wrapper.promise = { resolve: fn, reject: fn }
    wrapper.setState = jest.fn()

    wrapper.cancel()
    wrapper.handleConfirm()
    wrapper.handleCalibrate(20, 50)

    expect(calibrateDoser).toHaveBeenCalledWith(1, { duration: 20, speed: 50 })
  })
})
