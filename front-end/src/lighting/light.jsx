import React from 'react'
import PropTypes from 'prop-types'
import LightChannel from './channel'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18next from 'i18next'

const EditLight = ({
  values,
  config,
  errors,
  touched,
  submitForm,
  isValid,
  handleBlur,
  handleChange,
  dirty,
  readOnly,
  ...props
}) => {
  const handleFormSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError('The light settings cannot be saved due to validation errors.  Please correct the errors and try again.')
    }
  }

  const channels = () => {
    return Object.keys(values.config.channels).map((item) => (
      <LightChannel
        {...props}
        key={item}
        values={values}
        errors={errors}
        touched={touched}
        name={'config.channels.' + item}
        readOnly={readOnly}
        onBlur={handleBlur}
        onChangeHandler={handleChange}
        channel={values.config.channels[item]}
        channelNum={item}
      />
    ))
  }

  return (
    <form onSubmit={handleFormSubmit} id={'form-light-' + values.config.id}>

      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='config.name'>{i18next.t('name')}</label>
            <Field
              name='config.name'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('config.name', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='config.name' />
          </div>
        </div>
      </div>

      {channels()}
      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col-12'>
          <input
            type='submit'
            value={i18next.t('save')}
            id={'save-light-' + config.id}
            disabled={readOnly}
            className='btn btn-sm btn-primary float-right mt-1'
          />
        </div>
      </div>
    </form>
  )
}

EditLight.propTypes = {
  values: PropTypes.array,
  config: PropTypes.object,
  submitForm: PropTypes.func,
  isValid: PropTypes.bool,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  dirty: PropTypes.bool,
  readOnly: PropTypes.bool,
  touched: PropTypes.array,
  errors: PropTypes.array
}

export default EditLight
