import React from 'react'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import { withFormik, Field } from 'formik'
import { FaCheck } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import i18next from 'i18next'

export const Calibrate = ({ values, errors, touched, label, submitForm, complete, readOnly }) => {
  const handleSubmit = event => {
    event.preventDefault()
    submitForm()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='form-group row'>
        <label htmlFor='value' className='col-4 col-form-label'>
          {label}
        </label>
        <div className='col-4'>
          <div className='form-group'>
            <Field
              name='value'
              type='number'
              step='any'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('value', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='value' />
          </div>
        </div>
        <div className='col-4'>
          {complete
            ? (
              <IconContext.Provider value={{ color: 'blue', className: 'align-bottom' }}>
                <FaCheck />
              </IconContext.Provider>
              )
            : (
              <input
                type='submit'
                disabled={readOnly}
                value={i18next.t('ph:run_calibration')}
                className='btn btn-sm btn-outline-primary'
              />
              )}
        </div>
      </div>
    </form>
  )
}

const CalibrateSchema = Yup.object().shape({
  value: Yup.number()
    .required()
})

const CalibrateForm = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: props => {
    return {
      value: props.defaultValue
    }
  },
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(props.point, parseFloat(values.value))
  }
})(Calibrate)

export default CalibrateForm
