import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import Cron from '../ui_components/cron'
import i18next from 'i18next'
import Target from './target'

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
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        i18next.t('timers:validation_error')
      )
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
    let target = {}
    switch (targetType) {
      case 'macro':
        target = {
          id: ''
        }
        break
      case 'equipment':
        target = { id: '', on: true, revert: false, duration: 60 }
        break
      case 'reminder':
        target = { title: '', message: '' }
        break
    }
    return target
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='row'>

        <div className='col col-sm-6 col-lg-3 order-lg-1'>
          <div className='form-group'>
            <label htmlFor='name'>{i18next.t('name')}</label>
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

        <div className='col-12 col-sm-6 col-lg-3 order-lg-2'>
          <div className='form-group'>
            <label htmlFor='enable'>{i18next.t('status')}</label>
            <Field
              name='enable'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('enable', touched, errors)
              })}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='enable' />
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-12 col-sm-6 col-lg-3 order-lg-3'>
          <div className='form-group'>
            <label htmlFor='type'>{i18next.t('timers:function')}</label>
            <Field
              name='type'
              component='select'
              disabled={readOnly}
              onChange={handleConfigChange}
              className={classNames('custom-select', {
                'is-invalid': ShowError('type', touched, errors)
              })}
            >
              <option value='' className='d-none'>-- {i18next.t('select')} --</option>
              <option value='equipment'>{i18next.t('timers:equipment')}</option>
              <option value='reminder'>{i18next.t('timers:reminder')}</option>
              <option value='macro'>{i18next.t('timers:macros')}</option>
            </Field>
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
      <div className='row'>
        <div className='col'>
          <div className='row form-group'>
            <label htmlFor='enable'>{i18next.t('schedule')}</label>
          </div>
          <Cron
            values={values}
            touched={touched}
            errors={errors}
            readOnly={readOnly}
          />
        </div>
      </div>

      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col-12'>
          <input
            type='submit'
            value={i18next.t('save')}
            disabled={readOnly}
            className='btn btn-sm btn-primary float-right mt-1'
          />
        </div>
      </div>

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
