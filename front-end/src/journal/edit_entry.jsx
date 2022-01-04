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
  dirty
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18next.t('validation:error'))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={classNames('d-flex row')}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='value'>{i18next.t('journal:value')}</label>
            <Field
              name='value'
              type='number'
              className={classNames('form-control', {
                'is-invalid': ShowError('value', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='value' />
          </div>
        </div>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='comment'>{i18next.t('journal:comment')}</label>
            <Field
              name='comment'
              className={classNames('form-control', {
                'is-invalid': ShowError('description', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='comment' />
          </div>
        </div>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='comment'>{i18next.t('journal:timestamp')}</label>
            <Field
              name='timestamp'
              className={classNames('form-control', {
                'is-invalid': ShowError('timestamp', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='timestamp' />
          </div>
        </div>
      </div>

      <div className={classNames('row')}>
        <div className='col-12'>
          <input
            type='submit'
            value={i18next.t('journal:add_entry')}
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
