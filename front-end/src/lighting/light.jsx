import React from 'react'
import PropTypes from 'prop-types'
import LightChannel from './channel'
import { showError, showUpdateSuccessful } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

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
  jacks,
  ...props
}) => {
  const handleFormSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18next.t('validation:error'))
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

      <div className={classNames({ 'd-none': readOnly })} style={{ display: readOnly ? 'none' : 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginBottom: 'var(--reefpi-space-sm)' }}>
        <div>
          <div>
            <label htmlFor='config.name'>{i18next.t('name')}</label>
            <Field
              name='config.name'
              disabled={readOnly}
              className={classNames({ 'is-invalid': ShowError('config.name', touched, errors) })}
              style={{ display: 'block', width: '100%', padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)' }}
            />
            <ErrorFor errors={errors} touched={touched} name='config.name' />
          </div>
        </div>
        <div>
          <div>
            <label htmlFor='config.enable'>
              <Field
                type='checkbox'
                name='config.enable'
                id='config.enable'
                disabled={readOnly}
              />
              &nbsp;{i18next.t('enabled')}
            </label>
          </div>
        </div>
        <div>
          <div>
            <label htmlFor='config.jack'>{i18next.t('lighting:jack')}</label>
            <Field
              name='config.jack'
              component='select'
              disabled={readOnly}
              className={classNames({ 'is-invalid': ShowError('config.jack', touched, errors) })}
              style={{ display: 'block', width: '100%', padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)' }}
            >
              {(jacks || []).map(j => (
                <option key={j.id} value={String(j.id)}>{j.name}</option>
              ))}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='config.jack' />
          </div>
        </div>
      </div>

      {channels()}
      <div style={{ display: readOnly ? 'none' : 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-xs)' }}>
        <Button
          type='submit'
          disabled={readOnly}
          id={'save-light-' + config.id}
          variant='primary'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
        >
          {i18next.t('save')}
        </Button>
      </div>
    </form>
  )
}

EditLight.propTypes = {
  values: PropTypes.object,
  config: PropTypes.object,
  submitForm: PropTypes.func,
  isValid: PropTypes.bool,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  dirty: PropTypes.bool,
  readOnly: PropTypes.bool,
  touched: PropTypes.object,
  errors: PropTypes.object,
  jacks: PropTypes.array
}

export default EditLight
