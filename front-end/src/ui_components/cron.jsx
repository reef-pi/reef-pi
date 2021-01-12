import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'i18next'

const Cron = ({ values, errors, touched, readOnly }) => {
  return (
    <div className='row'>

      <div className='form-group col-12 col-sm-4 col-md-2'>
        <label htmlFor='month'>{i18next.t('cron:month')}</label>
        <Field
          name='month'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('month', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='month' />
      </div>

      <div className='form-group col-12 col-sm-4 col-md-2'>
        <label htmlFor='week'>{i18next.t('cron:week')}</label>
        <Field
          name='week'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('week', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='week' />
      </div>

      <div className='form-group col-12 col-sm-4 col-md-2'>
        <label htmlFor='day'>{i18next.t('cron:day_of_month')}</label>
        <Field
          name='day'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('day', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='day' />
      </div>

      <div className='form-group col-12 col-sm-4 col-md-2'>
        <label htmlFor='hour'>{i18next.t('cron:hour')}</label>
        <Field
          name='hour'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('hour', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='hour' />
      </div>

      <div className='form-group col-12 col-sm-4 col-md-2'>
        <label htmlFor='minute'>{i18next.t('cron:minute')}</label>
        <Field
          name='minute'
          disabled={readOnly}
          className={classNames('col form-control', {
            'is-invalid': ShowError('minute', touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name='minute' />
      </div>

      <div className='form-group col-12 col-sm-4 col-md-2'>
        <label htmlFor='second'>{i18next.t('cron:second')}</label>
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
