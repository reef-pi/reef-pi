import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import Chart from './chart'
import i18next from 'i18next'

const EditPh = ({
  values,
  errors,
  touched,
  analogInputs,
  probe,
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
      showError(i18next.t('ph:validation_error'))
    }
  }

  const analogInputOptions = () => {
    return analogInputs.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }

  const chart = () => {
    if (!values.enable || !probe) {
      return (<div />)
    }
    return (
      <div className='row d-none d-sm-flex'>
        <div className='col-lg-6'>
          <Chart probe_id={probe.id} width={500} height={300} type='current' />
        </div>
        <div className='col-lg-6'>
          <Chart probe_id={probe.id} width={500} height={300} type='historical' />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='row'>
        <div className='col col-sm-6 col-md-3'>
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
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='analog_input'>{i18next.t('analog_input')}</label>
            <Field
              name='analog_input'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('analog_input', touched, errors)
              })}
            >
              <option value='' className='d-none'>
                  -- {i18next.t('select')} --
              </option>
              {analogInputOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='analog_input' />
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='period'>{i18next.t('ph:check_frequency')}</label>
            <div className='input-group'>
              <Field
                name='period'
                readOnly={readOnly}
                type='number'
                className={classNames('form-control', {
                  'is-invalid': ShowError('period', touched, errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                  {i18next.t('second_s')}
                </span>
                <span className='input-group-text d-flex d-lg-none'>{i18next.t('sec')}</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='period' />
            </div>
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='enable'>{i18next.t('ph:status')}</label>
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
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='notify'>{i18next.t('alerts')}</label>
            <Field
              name='notify'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('notify', touched, errors)
              })}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='notify' />
          </div>
        </div>

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='minAlert'>{i18next.t('ph:alert_below')}</label>
            <Field
              name='minAlert'
              readOnly={readOnly || values.notify === false}
              className={classNames('form-control', {
                'is-invalid': ShowError('minAlert', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='minAlert' />
          </div>
        </div>

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='maxAlert'>{i18next.t('ph:alert_above')}</label>
            <Field
              name='maxAlert'
              readOnly={readOnly || values.notify === false}
              className={classNames('form-control', {
                'is-invalid': ShowError('maxAlert', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='maxAlert' />
          </div>
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
      {chart()}
    </form>
  )
}

EditPh.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func,
  analogInputs: PropTypes.array
}

export default EditPh
