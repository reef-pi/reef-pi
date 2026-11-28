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
  onCancel,
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
    <form onSubmit={handleFormSubmit} id={'form-light-' + values.config.id} className='reefpi-lighting-form'>
      {!readOnly && (
        <section className='reefpi-section-card reefpi-lighting-fixture' aria-label={i18next.t('lighting:fixture_settings', { defaultValue: 'Light settings' })}>
          <div className='reefpi-controller-section__header'>
            <h3>{i18next.t('lighting:fixture_settings', { defaultValue: 'Light settings' })}</h3>
            <p>{i18next.t('lighting:fixture_help', { defaultValue: 'Name the fixture, choose its jack, and configure each PWM channel below.' })}</p>
          </div>
          <div className='reefpi-lighting-fixture__settings'>
            <div>
              <label htmlFor='config.name'>{i18next.t('name')}</label>
              <Field
                id='config.name'
                name='config.name'
                disabled={readOnly}
                className={classNames({ 'is-invalid': ShowError('config.name', touched, errors) })}
              />
              <ErrorFor errors={errors} touched={touched} name='config.name' />
            </div>
            <div className='reefpi-check reefpi-lighting-fixture__toggle'>
              <Field
                type='checkbox'
                name='config.enable'
                id='config.enable'
                disabled={readOnly}
              />
              <label htmlFor='config.enable'>{i18next.t('enabled')}</label>
            </div>
            <div>
              <label htmlFor='config.jack'>{i18next.t('lighting:jack')}</label>
              <Field
                id='config.jack'
                name='config.jack'
                component='select'
                disabled={readOnly}
                className={classNames({ 'is-invalid': ShowError('config.jack', touched, errors) })}
              >
                {(jacks || []).map(j => (
                  <option key={j.id} value={String(j.id)}>{j.name}</option>
                ))}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='config.jack' />
            </div>
          </div>
        </section>
      )}

      <div className='reefpi-lighting-form__channels'>{channels()}</div>
      {!readOnly && (
        <div className='reefpi-controller-form__actions'>
          <Button
            type='button'
            variant='secondary'
            data-testid='lighting-cancel'
            onClick={onCancel}
          >
            {i18next.t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type='submit'
            disabled={readOnly}
            id={'save-light-' + config.id}
            variant={dirty ? 'primary' : 'secondary'}
          >
            {i18next.t('save')}
          </Button>
        </div>
      )}
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
  jacks: PropTypes.array,
  onCancel: PropTypes.func
}

export default EditLight
