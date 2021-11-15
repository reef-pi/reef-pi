import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'i18next'

const EditEntry = ({
  values,
  errors,
  touched,
  submitForm,
  isValid,
  dirty,
  readOnly
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        i18next.t('journal:validation_error')
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='value'>{i18next.t('journal:value')}</label>
            <Field
              name='value'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('value', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='value' />
          </div>
        </div>
      </div>
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='comment'>{i18next.t('journal:comment')}</label>
            <Field
              name='comment'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('description', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='comment' />
          </div>
        </div>
      </div>
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='time'>{i18next.t('journal:time')}</label>
            <Field
              name='time'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('time', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='time' />
          </div>
        </div>
      </div>

      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col-12'>
          <input
            type='submit'
            value={i18next.t('add')}
            disabled={readOnly}
            className='btn btn-sm btn-primary float-right mt-1'
          />
        </div>
      </div>
    </form>
  )
}

EditEntry.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditEntry
