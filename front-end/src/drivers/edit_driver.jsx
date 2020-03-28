import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'

const EditDriver = ({
  values,
  errors,
  touched,
  submitForm,
  handleChange,
  mode,
  isValid,
  dirty,
  readOnly,
  driverOptions
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        'The Driver settings cannot be saved due to validation errors.  Please correct the errors and try again.'
      )
    }
  }

  const driverTypeChangeHandler = (e) => {
    values.config = {}
    driverOptions[e.target.value].map(item => {
      values.config[item.name.toLowerCase()] = ''
    })
    handleChange(e)
  }

  const driverConfig = () => {
    const selectedType = driverOptions[values.type]
    if (selectedType == null) { return null }
    const params = []

    selectedType.sort((a, b) => { return parseInt(a.order) > parseInt(b.order) })
      .forEach((item) => {
        const param = (
          <div key={item.name} className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor={'config.' + item.name.toLowerCase()}>{item.name}</label>
              <Field
                name={'config.' + item.name.toLowerCase()}
                disabled={readOnly}
                placeholder={item.default}
                className={classNames('form-control', {
                  'is-invalid': ShowError('config.' + item.name.toLowerCase(), touched, errors)
                })}
              />
              <ErrorFor errors={errors} touched={touched} name={'config.' + item.name.toLowerCase()} />
            </div>
          </div>
        )
        params.push(param)
      })

    return (
      <div className={classNames('row', { 'd-none': readOnly })}>
        {params}
      </div>
    )
  }

  const typeOptions = () => {
    return Object.keys(driverOptions).map(item => {
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
              onChange={driverTypeChangeHandler}
              disabled={mode === 'edit' || readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('type', touched, errors)
              })}
            >
              <option value='' className='d-none'>
                  -- Select --
              </option>
              {typeOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='type' />
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
  handleChange: PropTypes.func,
  driverOptions: PropTypes.object
}

export default EditDriver
