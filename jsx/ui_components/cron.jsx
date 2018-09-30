import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'

const Cron = ({values, errors, touched, readOnly}) => {
  return (
    <div className='row'>

      <div className='form-group col-12 col-sm-6 col-md-3'>
        <label htmlFor='day'>Day of month</label>
        <Field
          name='day'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('day', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='day' />
      </div>

      <div className='form-group col-12 col-sm-6 col-md-3'>
        <label htmlFor='hour'>Hour</label>
        <Field
          name='hour'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('hour', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='hour' />
      </div>

      <div className='form-group col-12 col-sm-6 col-md-3'>
        <label htmlFor='minute'>Minute</label>
        <Field
          name='minute'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('minute', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='minute' />
      </div>

      <div className='form-group col-12 col-sm-6 col-md-3'>
        <label htmlFor='second'>Second</label>
        <Field
          name='second'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('second', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='second' />
      </div>

    </div>
  )
}

export default Cron

Cron.propTypes = {
  readOnly: PropTypes.bool,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired
}
