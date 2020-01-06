import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import i18next from 'i18next'
import ATOChart from './chart'

const EditAto = ({
  values,
  errors,
  touched,
  inlets,
  equipment,
  macros,
  submitForm,
  isValid,
  dirty,
  readOnly
}) => {
  const charts = () => {
    if (!values.enable) {
      return
    }
    return (
      <div className='row'>
        <ATOChart ato_id={values.id} width={500} height={300} ato_name={values.name} />
      </div>
    )
  }
  const controlOptions = () => {
    let opts = []

    if (values.control === 'equipment') { opts = equipment } else if (values.control === 'macro') { opts = macros }

    return opts.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        i18next.t('ato:validation_error')
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

  return (
    <form onSubmit={handleSubmit}>
      <div className={classNames('row', { 'd-none': readOnly })}>
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
      </div>

      <div className='row'>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='inlet'>{i18next.t('inlet')}</label>
            <Field
              name='inlet'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('inlet', touched, errors)
              })}
            >
              <option value='' className='d-none'>
                  -- {i18next.t('select')} --
              </option>
              {inletOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='inlet' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='period'>{i18next.t('ato:chk_freq')}</label>
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
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='period' />
            </div>
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='enable'>{i18next.t('ato:ato_status')}</label>
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
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='control'>{i18next.t('ato:control')}</label>
            <Field
              name='control'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('control', touched, errors)
              })}
            >
              <option value='nothing'>{i18next.t('ato:controlnothing')}</option>
              <option value='macro'>{i18next.t('ato:controlmacro')}</option>
              <option value='equipment'>{i18next.t('ato:controlequipment')}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='control' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='pump'>{i18next.t('ato:control_pump')}</label>
            <Field
              name='pump'
              component='select'
              disabled={readOnly || values.control === 'nothing'}
              className={classNames('custom-select', {
                'is-invalid': ShowError('pump', touched, errors)
              })}
            >
              <option key='' value=''>
                {i18next.t('none')}
              </option>
              {controlOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='pump' />
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
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='disable_on_alert'>{i18next.t('ato:disable_on_alert')}</label>
            <Field
              name='disable_on_alert'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('notify', touched, errors)
              })}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
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
            <label htmlFor='maxAlert'>{i18next.t('ato:alert_after')}</label>
            <div className='input-group'>
              <Field
                title={i18next.t('ato:total_seconds_pump_on')}
                name='maxAlert'
                type='number'
                readOnly={readOnly || values.notify === false}
                className={classNames('form-control px-sm-1 px-md-2', {
                  'is-invalid': ShowError('maxAlert', touched, errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                  {i18next.t('second_s')}
                </span>
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='maxAlert' />
            </div>
          </div>
        </div>
      </div>
      {charts()}

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
