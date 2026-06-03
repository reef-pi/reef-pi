import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import classNames from 'classnames'
import { Field as FormikField } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import Cron from '../ui_components/cron'
import Target from './target'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

const formGridStyle = {
  display: 'grid',
  gap: 'var(--reefpi-space-md)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  width: '100%'
}

const EditTimer = ({
  values,
  errors,
  touched,
  equipment,
  macros,
  submitForm,
  isValid,
  dirty,
  handleBlur,
  handleChange,
  readOnly,
  ...props
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18n.t('validation:error'))
    }
  }

  // handleConfigChange intercepts the change handler for type and also changes the target.
  // This is required in order for Formik to know which fields may be in the validation
  const handleConfigChange = e => {
    const event = {
      target: {
        name: 'target',
        value: targetFor(e.target.value)
      }
    }

    // allow the original change of the type field to proceed
    handleChange(e, props)
    // notify the change of the target
    handleChange(event, props)
  }

  const targetFor = targetType => {
    switch (targetType) {
      case 'macro':
        return { id: '' }
      case 'reminder':
        return { title: '', message: '' }
      case 'equipment':
        return { id: '', on: true, revert: true, duration: 60 }
      case 'lightings':
      case 'ato':
      case 'doser':
      case 'phprobes':
      case 'temperature':
      case 'camera':
        return { id: '', on: true, revert: false, duration: 60 }
    }
    return {}
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={formGridStyle}>

        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='name'>{i18n.t('name')}</label>
            <FormikField
              name='name'
              data-testid='smoke-timer-name'
              disabled={readOnly}
              className={classNames({ 'is-invalid': ShowError('name', touched, errors) })}
            />
            <ErrorFor errors={errors} touched={touched} name='name' />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='enable'>{i18n.t('status')}</label>
            <FormikField
              name='enable'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('enable', touched, errors)
              })}
            >
              <option value='true'>{i18n.t('enabled')}</option>
              <option value='false'>{i18n.t('disabled')}</option>
            </FormikField>
            <ErrorFor errors={errors} touched={touched} name='enable' />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <label htmlFor='type'>{i18n.t('timers:function')}</label>
            <FormikField
              name='type'
              component='select'
              data-testid='smoke-timer-type'
              disabled={readOnly}
              onChange={handleConfigChange}
              className={classNames('custom-select', {
                'is-invalid': ShowError('type', touched, errors)
              })}
            >
              <option value='' className='d-none'>-- {i18n.t('select')} --</option>
              <option value='equipment'>{i18n.t('function:equipment')}</option>
              <option value='reminder'>{i18n.t('function:reminder')}</option>
              <option value='macro'>{i18n.t('function:macro')}</option>
              <option value='ato'>{i18n.t('function:ato')}</option>
              <option value='camera'>{i18n.t('function:camera')}</option>
              <option value='doser'>{i18n.t('function:doser')}</option>
              <option value='lightings'>{i18n.t('function:lightings')}</option>
              <option value='phprobes'>{i18n.t('function:phprobes')}</option>
              <option value='temperature'>{i18n.t('function:temperature')}</option>
            </FormikField>
            <ErrorFor errors={errors} touched={touched} name='type' />
          </div>
        </div>

        <Target
          {...props}
          name='target'
          type={values.type}
          target={values.target}
          macros={macros}
          equipment={equipment}
          errors={errors}
          touched={touched}
          readOnly={readOnly}
          onBlur={handleBlur}
          onChangeHandler={handleChange}
        />
      </div>

      <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
        <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
          <label htmlFor='enable'>{i18n.t('schedule')}</label>
        </div>
        <Cron
          values={values}
          touched={touched}
          errors={errors}
          readOnly={readOnly}
        />
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', marginTop: 'var(--reefpi-space-xs)' }}>
          <Button
            type='submit'
            data-testid='smoke-timer-submit'
            disabled={readOnly}
            style={{ marginLeft: 'auto', padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18n.t('save')}
          </Button>
        </div>
      )}

    </form>
  )
}

EditTimer.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  equipment: PropTypes.array,
  macros: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditTimer
