import React from 'react'
import PropTypes from 'prop-types'
import { ErrorMessage, ErrorFor, ShowError } from '../utils/validation_helper'
import i18next from 'i18next'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import Cron from '../ui_components/cron'
import EditStepper from './edit_stepper'
import EditDcPump from './edit_dcpump'

const EditDoser = ({
  values,
  errors,
  touched,
  doser,
  jacks,
  outlets,
  submitForm,
  isValid,
  onBlur,
  handleChange,
  setFieldValue,
  dirty,
  readOnly
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm()
      showError(i18next.t('validation:error') + ErrorMessage(errors, ''))
    }
  }

  const driverUI = () => {
    if (values.type === 'stepper') {
      return (
        <EditStepper
          values={values}
          readOnly={readOnly}
          errors={errors}
          touched={touched}
          outlets={outlets}
          isValid={isValid}
          onBlur={onBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          dirty={dirty}
        />
      )
    } else {
      return (
        <EditDcPump
          values={values}
          readOnly={readOnly}
          errors={errors}
          touched={touched}
          jacks={jacks}
          isValid={isValid}
          onBlur={onBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          dirty={dirty}
        />
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='row'>

        <div className='col-12 col-sm-6 col-md-3'>
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
            <label htmlFor='volume'>{i18next.t('doser:volume')}</label>
            <Field
              name='volume'
              readOnly={readOnly}
              type='number'
              className={classNames('form-control', {
                'is-invalid': ShowError('volume', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='volume' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='type'>{i18next.t('doser:type')}</label>
            <Field
              name='type'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('type', touched, errors)
              })}
            >
              <option value='dcpump' key='dcpump'> DC motor </option>
              <option value='stepper' key='stepper'> Stepper</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='type' />
          </div>
        </div>
      </div>
      {driverUI()}

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

EditDoser.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditDoser
