import React from 'react'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18next from 'i18next'
import classNames from 'classnames'
import { withFormik, Field } from 'formik'

export const Calibrate = ({
  values,
  errors,
  touched,
  submitForm,
  complete,
  readOnly
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    submitForm()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='form-group row'>
        <label htmlFor='speed' className='col-2 col-form-label'>{i18next.t('doser:speed')}</label>
        <div className='col-3'>
          <div className='form-group'>
            <Field
              name='speed'
              type='number'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('speed', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='speed' />
          </div>
        </div>
        <label htmlFor='duration' className='col-2 col-form-label'>{i18next.t('doser:duration')}</label>
        <div className='col-3'>
          <div className='form-group'>
            <Field
              name='duration'
              type='number'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('duration', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='duration' />
          </div>
        </div>
        <div className='col-2'>
          <input
            type='submit'
            disabled={readOnly}
            value={i18next.t('doser:calibration:run')}
            className='btn btn-sm btn-outline-primary'
          />
        </div>
      </div>
    </form>
  )
}

const CalibrateSchema = Yup.object().shape({
  duration: Yup.number()
    .required(),
  speed: Yup.number()
    .required()
    .min(0)
    .max(100)
})

const CalibrateForm = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: props => {
    return {
      duration: props.duration,
      speed: props.speed
    }
  },
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(parseFloat(values.duration), parseInt(values.speed))
  }
})(Calibrate)

export default CalibrateForm
