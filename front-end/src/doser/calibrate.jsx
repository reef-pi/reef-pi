import React from 'react'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18n from 'utils/i18n'
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

  const dcPump = () => {
    return (
      <>
        <label htmlFor='speed' className='col-2 col-form-label'>{i18n.t('doser:speed')}</label>
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
        <label htmlFor='duration' className='col-2 col-form-label'>{i18n.t('doser:duration')}</label>
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
      </>
    )
  }

  const stepper = () => {
    return (
      <>
        <label htmlFor='volume' className='col-2 col-form-label'>{i18n.t('doser:volume')}</label>
        <div className='col-3'>
          <div className='form-group'>
            <Field
              name='volume'
              type='number'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('volume', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='duration' />
          </div>
        </div>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='form-group row'>
        {values.pumpType === 'stepper' ? stepper() : dcPump()}
        <div className='col-2'>
          <input
            type='submit'
            disabled={readOnly}
            value={i18n.t('doser:calibration:run')}
            className='btn btn-sm btn-outline-primary'
          />
        </div>
      </div>
    </form>
  )
}

const CalibrateSchema = Yup.object().shape({
  duration: Yup.number(),
  speed: Yup.number(),
  volume: Yup.number()
})

const CalibrateForm = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: props => {
    return {
      duration: props.duration,
      speed: props.speed,
      volume: props.volume,
      pumpType: props.pumpType
    }
  },
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(parseFloat(values.duration), parseInt(values.speed), parseFloat(values.volume))
  }
})(Calibrate)

export default CalibrateForm
