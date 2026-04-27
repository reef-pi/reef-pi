import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from 'utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import classNames from 'classnames'
import BooleanSelect from 'ui_components/boolean_select'
import i18n from 'utils/i18n'

const EditFlowMeter = ({
  values,
  errors,
  touched,
  submitForm,
  isValid,
  dirty,
  readOnly
}) => {
  const handleSubmit = e => {
    e.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm()
      showError(i18n.t('validation:error'))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='row'>
        <div className='col-12 col-sm-6 col-lg-3'>
          <div className='form-group'>
            <label>{i18n.t('name')}</label>
            <Field
              name='name'
              disabled={readOnly}
              className={classNames('form-control', { 'is-invalid': ShowError('name', touched, errors) })}
            />
            <ErrorFor errors={errors} touched={touched} name='name' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-lg-3'>
          <div className='form-group'>
            <label>{i18n.t('status')}</label>
            <Field
              name='enable'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', { 'is-invalid': ShowError('enable', touched, errors) })}
            >
              <option value='true'>{i18n.t('enabled')}</option>
              <option value='false'>{i18n.t('disabled')}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='enable' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-lg-3'>
          <div className='form-group'>
            <label>{i18n.t('flow_meter:sensor_path')}</label>
            <Field
              name='sensor'
              disabled={readOnly}
              placeholder='/tmp/flow_pulse_count'
              className={classNames('form-control', { 'is-invalid': ShowError('sensor', touched, errors) })}
            />
            <ErrorFor errors={errors} touched={touched} name='sensor' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-lg-3'>
          <div className='form-group'>
            <label>{i18n.t('flow_meter:pulses_per_liter')}</label>
            <div className='input-group'>
              <Field
                name='pulses_per_liter'
                type='number'
                disabled={readOnly}
                className={classNames('form-control', { 'is-invalid': ShowError('pulses_per_liter', touched, errors) })}
              />
              <div className='input-group-append'>
                <span className='input-group-text'>p/L</span>
              </div>
            </div>
            <ErrorFor errors={errors} touched={touched} name='pulses_per_liter' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-lg-3'>
          <div className='form-group'>
            <label>{i18n.t('flow_meter:period')}</label>
            <div className='input-group'>
              <Field
                name='period'
                type='number'
                disabled={readOnly}
                className={classNames('form-control', { 'is-invalid': ShowError('period', touched, errors) })}
              />
              <div className='input-group-append'>
                <span className='input-group-text'>{i18n.t('second_s')}</span>
              </div>
            </div>
            <ErrorFor errors={errors} touched={touched} name='period' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-lg-3'>
          <div className='form-group'>
            <label>{i18n.t('flow_meter:notify_enable')}</label>
            <Field
              name='notify_enable'
              component={BooleanSelect}
              disabled={readOnly}
              className='custom-select'
            >
              <option value='false'>{i18n.t('disabled')}</option>
              <option value='true'>{i18n.t('enabled')}</option>
            </Field>
          </div>
        </div>

        {values.notify_enable && (
          <div className='col-12 col-sm-6 col-lg-3'>
            <div className='form-group'>
              <label>{i18n.t('flow_meter:min_flow')}</label>
              <div className='input-group'>
                <Field
                  name='notify_min'
                  type='number'
                  disabled={readOnly}
                  className={classNames('form-control', { 'is-invalid': ShowError('notify_min', touched, errors) })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>L/h</span>
                </div>
              </div>
              <ErrorFor errors={errors} touched={touched} name='notify_min' />
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className='row'>
          <div className='col-12'>
            <input
              type='submit'
              value={i18n.t('save')}
              className='btn btn-sm btn-primary float-right mt-1'
            />
          </div>
        </div>
      )}
    </form>
  )
}

EditFlowMeter.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  submitForm: PropTypes.func.isRequired,
  isValid: PropTypes.bool,
  dirty: PropTypes.bool,
  readOnly: PropTypes.bool
}

export default EditFlowMeter
