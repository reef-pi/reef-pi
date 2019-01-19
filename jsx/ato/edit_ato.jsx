import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'

const EditAto = ({
  values,
  errors,
  touched,
  inlets,
  equipment,
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

  const inletOptions = () => {
    return inlets.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }

  const equipmentOptions = () => {
    return equipment.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
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
            <label htmlFor='inlet'>Inlet</label>
            <Field
              name='inlet'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('inlet', touched, errors)
              })}
            >
              <option value='' className='d-none'>
                  -- Select --
              </option>
              {inletOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='inlet' />
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
            <label htmlFor='enable'>ATO Status</label>
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

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='pump'>Control Pump</label>
            <Field
              name='pump'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('pump', touched, errors)
              })}
            >
              <option key='' value=''>
                  None
              </option>
              {equipmentOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='pump' />
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='notify'>Alerts</label>
            <Field
              name='notify'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('notify', touched, errors)
              })}
            >
              <option value='true'>Enabled</option>
              <option value='false'>Disabled</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='notify' />
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='disable_on_alert'>Disable on alert</label>
            <Field
              name='disable_on_alert'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('notify', touched, errors)
              })}
            >
              <option value='true'>Enabled</option>
              <option value='false'>Disabled</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='disable_on_alert' />
          </div>
        </div>

        <div
          className={classNames('col-12 col-sm-3 col-md-3 d-sm-block', {
            'd-none': values.notify === false
          })}
        >
          <div className='form-group'>
            <label htmlFor='maxAlert'>Alert After</label>
            <div className='input-group'>
              <Field
                title='Total number of seconds ato pump is on'
                name='maxAlert'
                type='number'
                readOnly={readOnly || values.notify === false}
                className={classNames('form-control px-sm-1 px-md-2', {
                  'is-invalid': ShowError('maxAlert', touched, errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                    second(s)
                </span>
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='maxAlert' />
            </div>
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
    </form>
  )
}

EditAto.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  inlets: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditAto
