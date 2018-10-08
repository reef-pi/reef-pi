import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showAlert, clearAlert } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import Chart from './chart'

const EditPh = ({
  values,
  errors,
  touched,
  probe,
  submitForm,
  isValid,
  dirty,
  readOnly
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    clearAlert()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showAlert(
        'The Ph settings cannot be saved due to validation errors.  Please correct the errors and try again.'
      )
    }
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

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='name'>Address</label>
            <Field
              name='address'
              type='number'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('address', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='address' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='period'>Check Frequency</label>
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
                    second(s)
                </span>
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='period' />
            </div>
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='enable'>Ph Status</label>
            <Field
              name='enable'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('enable', touched, errors)
              })}
            >
              <option value='true'>Enabled</option>
              <option value='false'>Disabled</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='enable' />
          </div>
        </div>

      </div>

      <div className='row'>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='alerts'>Alerts</label>
            <Field
              name='alerts'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('alerts', touched, errors)
              })}
            >
              <option value='true'>Enabled</option>
              <option value='false'>Disabled</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='alerts' />
          </div>
        </div>

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='minAlert'>Alert Below</label>
            <Field
              name='minAlert'
              readOnly={readOnly || values.alerts === false}
              className={classNames('form-control', {
                'is-invalid': ShowError('minAlert', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='minAlert' />
          </div>
        </div>

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='maxAlert'>Alert Above</label>
            <Field
              name='maxAlert'
              readOnly={readOnly || values.alerts === false}
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
            value='Save'
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
  handleChange: PropTypes.func
}

export default EditPh
