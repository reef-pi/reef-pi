import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showAlert, clearAlert } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import Cron from '../ui_components/cron'

const EditTimer = ({
  values,
  errors,
  touched,
  equipment,
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
        'The Timer settings cannot be saved due to validation errors.  Please correct the errors and try again.'
      )
    }
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

  const equipmentAction = () => {
    return (
      <React.Fragment>
        <div className='col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2'>
          <div className='form-group'>
            <label htmlFor='on'>Action</label>
            <Field
              name='on'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('on', touched, errors)
              })}
            >
              <option value='true'>Turn On</option>
              <option value='false'>Turn Off</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='on' />
          </div>
        </div>

        <div className='col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2'>
          <div className='form-group'>
            <label htmlFor='revert'>And Then</label>
            <Field
              name='revert'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('revert', touched, errors)
              })}
            >
              <option value='false'>Stay {values.on ? 'on' : 'off'}</option>
              <option value='true'>Turn back {values.on ? 'off' : 'on'}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='revert' />
          </div>
        </div>

        <div className={classNames('col-12 col-sm-4 col-lg-3 order-lg-6 col-xl-2', {'d-none': values.revert === false})}>
          <div className='form-group'>
            <label htmlFor='period'>After</label>
            <div className='input-group'>
              <Field
                name='duration'
                readOnly={readOnly || values.revert === false}

                className={classNames('form-control', {
                  'is-invalid': ShowError('duration', touched, errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                    second(s)
                </span>
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='duration' />
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  const reminderAction = () => {
    return (
      <React.Fragment>
        <div className='col-12 order-lg-7 col-xl-6'>
          <div className='form-group'>
            <label htmlFor='title'>Subject</label>
            <Field
              name='title'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('title', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='title' />
          </div>
        </div>

        <div className='col-12 order-lg-7 col-xl-6 offset-xl-6'>
          <div className='form-group'>
            <label htmlFor='message'>Message</label>
            <Field
              component='textarea'
              name='message'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('message', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='message' />
          </div>
        </div>
      </React.Fragment>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='row'>

        <div className='col col-sm-6 col-lg-3 order-lg-1'>
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

        <div className='col-12 col-sm-6 col-lg-3 order-lg-2'>
          <div className='form-group'>
            <label htmlFor='enable'>Timer Status</label>
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

        <div className='col-12 order-lg-5 col-xl-6'>
          <Cron values={values}
            touched={touched}
            errors={errors}
            readOnly={readOnly}
          />
        </div>

        <div className='col-12 col-sm-6 col-lg-3 order-lg-3'>
          <div className='form-group'>
            <label htmlFor='type'>Function</label>
            <Field
              name='type'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('type', touched, errors)
              })}
            >
              <option value='' className='d-none'>-- Select --</option>
              <option value='equipment'>Equipment</option>
              <option value='reminder'>Reminder</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='type' />
          </div>
        </div>

        <div className={classNames('col-12 col-sm-6 col-lg-3 order-lg-4', {
          'd-none': values.type === 'reminder'
        })}>
          <div className='form-group'>
            <label htmlFor='equipment_id'>Equipment</label>
            <Field
              name='equipment_id'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('equipment_id', touched, errors)
              })}
            >
              <option value='' className='d-none'>-- Select --</option>
              {equipmentOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='equipment_id' />
          </div>
        </div>

        {values.type === 'equipment' ? equipmentAction() : reminderAction()}

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

EditTimer.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  equipment: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditTimer
