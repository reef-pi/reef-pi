import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import {driverTypes} from './types'

const EditDriver = ({
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
        'The ATO settings cannot be saved due to validation errors.  Please correct the errors and try again.'
      )
    }
  }

  const phBoardConfig = () => {
    return (
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='name'>Address</label>
            <Field
              name='config.address'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('config.address', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='name' />
          </div>
        </div>
      </div>
    )
  }

  const pca9685Config = () => {
    return (
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='name'>Address</label>
            <Field
              name='config.address'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('config.address', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='name' />
          </div>
        </div>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='name'>Frequency</label>
            <Field
              name='config.frequency'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('config.frequency', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='name' />
          </div>
        </div>
      </div>
    )
  }

  const driverConfig = () => {
    switch (values.type) {
      case 'pca9685':
        return pca9685Config()
      case 'ph-board':
      case 'ph-ezo':
      case 'pico-board':
      case 'hs103':
      case 'hs110':
      case 'hs300':
      case 'file-analog':
      case 'file-digital':
        return phBoardConfig()
    }
  }

  const typeOptions = () => {
    return driverTypes.map(item => {
      return (
        <option key={item} value={item}>
          {item}
        </option>
      )
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='name'>Name</label>
            <Field
              name='name'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('name', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='name' />
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='inlet'>Type</label>
            <Field
              name='type'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('type', touched, errors)
              })}
            >
              <option value='' className='d-none'>
                  -- Select --
              </option>
              {typeOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='inlet' />
          </div>
        </div>
      </div>
      {driverConfig()}
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col-12'>
          <input
            type='submit'
            value='Save'
            disabled={readOnly}
            className='btn btn-sm btn-primary float-right mt-1'
          />
        </div>
      </div>
    </form>
  )
}

EditDriver.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditDriver
