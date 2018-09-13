import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showAlert, clearAlert } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from './boolean_select'
import ReadingsChart from './readings_chart'
import ControlChart from './control_chart'

const EditTemperature = ({
  values,
  errors,
  touched,
  sensors,
  equipment,
  submitForm,
  isValid,
  dirty,
  readOnly,
  showChart
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    clearAlert()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showAlert(
        'The temperature settings cannot be saved due to validation errors.  Please correct the errors and try again.'
      )
    }
  }

  const temperatureUnit = () => {
    return values.fahrenheit === true || values.fahrenheit === 'true'
      ? '\u2109'
      : '\u2103'
  }

  const charts = () => {
    if (!showChart || !values.enabled) {
      return
    }

    let charts = (
      <div className='row'>
        <div className='col'>
          <ReadingsChart sensor_id={values.id} width={500} height={300} />
        </div>
      </div>
    )

    if (values.heater !== '' || values.cooler !== '') {
      charts = (
        <div className='row'>
          <div className='col-lg-6'>
            <ReadingsChart sensor_id={values.id} width={500} height={300} />
          </div>
          <div className='col-lg-6'>
            <ControlChart sensor_id={values.id} width={500} height={300} />
          </div>
        </div>
      )
    }

    return (
      <div className='d-none d-sm-block'>
        {charts}
        <div className='row'>
          <div className='col-sm-12 col-md-6'>
            <label htmlFor='chart_min'>Chart Minimum</label>
            <Field
              name='chart_min'
              className='form-control'
              readOnly={readOnly}
            />
          </div>
          <div className='col-sm-12 col-md-6'>
            <label htmlFor='chart_max'>Chart Maximum</label>
            <Field
              name='chart_max'
              className='form-control'
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
    )
  }

  const sensorOptions = () => {
    return sensors.map(item => {
      return (
        <option key={item} value={item}>
          {item}
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
      <div>
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
              <label htmlFor='sensor'>Sensor</label>
              <Field
                name='sensor'
                component='select'
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('sensor', touched, errors)
                })}
              >
                <option value='' className='d-none'>
                  -- Select --
                </option>
                {sensorOptions()}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='sensor' />
            </div>
          </div>

          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='fahrenheit'>Unit</label>
              <Field
                name='fahrenheit'
                component={BooleanSelect}
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('fahrenheit', touched, errors)
                })}
              >
                <option value='true'>Fahrenheit</option>
                <option value='false'>Celcius</option>
              </Field>
              <ErrorFor errors={errors} touched={touched} name='fahrenheit' />
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
              <label htmlFor='enabled'>Sensor Status</label>
              <Field
                name='enabled'
                component={BooleanSelect}
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('enabled', touched, errors)
                })}
              >
                <option value='true'>Enabled</option>
                <option value='false'>Disabled</option>
              </Field>
              <ErrorFor errors={errors} touched={touched} name='enabled' />
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

          <div
            className={classNames('col-12 col-sm-3 col-md-3 d-sm-block', {
              'd-none': values.alerts === false
            })}
          >
            <div className='form-group'>
              <label htmlFor='minAlert'>Alert Below</label>
              <div className='input-group'>
                <Field
                  name='minAlert'
                  type='number'
                  readOnly={readOnly || values.alerts === false}
                  className={classNames('form-control px-sm-1 px-md-2', {
                    'is-invalid': ShowError('minAlert', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{temperatureUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='minAlert' />
              </div>
            </div>
          </div>

          <div
            className={classNames('col-12 col-sm-3 col-md-3 d-sm-block', {
              'd-none': values.alerts === false
            })}
          >
            <div className='form-group'>
              <label htmlFor='maxAlert'>Alert Above</label>
              <div className='input-group'>
                <Field
                  name='maxAlert'
                  type='number'
                  readOnly={readOnly || values.alerts === false}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('maxAlert', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{temperatureUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='maxAlert' />
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='heater'>Control Heater</label>
              <Field
                name='heater'
                component='select'
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('heater', touched, errors)
                })}
              >
                <option key='' value=''>
                  None
                </option>
                {equipmentOptions()}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='heater' />
            </div>
          </div>

          <div
            className={classNames('col-12 col-sm-6 col-md-3 d-sm-block', {
              'd-none': values.heater === ''
            })}
          >
            <div className='form-group'>
              <label htmlFor='min'>Heater Threshold</label>
              <div className='input-group'>
                <Field
                  name='min'
                  readOnly={readOnly || values.heater === ''}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('min', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{temperatureUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='min' />
              </div>
            </div>
          </div>

          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='cooler'>Control Chiller</label>
              <Field
                name='cooler'
                component='select'
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('cooler', touched, errors)
                })}
              >
                <option key='' value=''>
                  None
                </option>
                {equipmentOptions()}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='cooler' />
            </div>
          </div>

          <div
            className={classNames('col-12 col-sm-6 col-md-3 d-sm-block', {
              'd-none': values.cooler === ''
            })}
          >
            <div className='form-group'>
              <label htmlFor='max'>Chiller Threshold</label>
              <div className='input-group'>
                <Field
                  name='max'
                  readOnly={readOnly || values.cooler === ''}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('max', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{temperatureUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='max' />
              </div>
            </div>
          </div>
        </div>

        {charts()}
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

EditTemperature.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  sensors: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditTemperature
