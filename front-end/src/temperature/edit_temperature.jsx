import React from 'react'
import PropTypes from 'prop-types'
import ColorPicker from '../ui_components/color_picker'
import { NameFor, ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import ReadingsChart from './readings_chart'
import ControlChart from './control_chart'
import i18next from 'i18next'

const EditTemperature = ({
  values,
  errors,
  touched,
  sensors,
  equipment,
  macros,
  submitForm,
  isValid,
  dirty,
  readOnly,
  showChart
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        i18next.t('temperature:validation_error')
      )
    }
  }

  const updateChartColor = (e) => {
    values.chart.color = e.target.value
  }

  const temperatureUnit = () => {
    return values.fahrenheit === true || values.fahrenheit === 'true'
      ? '\u2109'
      : '\u2103'
  }

  const charts = () => {
    if (!showChart || !values.enable) {
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

  return (
    <form onSubmit={handleSubmit}>
      <div>
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
              <label htmlFor='sensor'>{i18next.t('temperature:sensor')}</label>
              <Field
                name='sensor'
                component='select'
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('sensor', touched, errors)
                })}
              >
                <option value='' className='d-none'>
                  -- {i18next.t('select')} --
                </option>
                {sensorOptions()}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='sensor' />
            </div>
          </div>

          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='fahrenheit'>{i18next.t('temperature:unit')}</label>
              <Field
                name='fahrenheit'
                component={BooleanSelect}
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('fahrenheit', touched, errors)
                })}
              >
                <option value='true'>{i18next.t('temperature:fahrenheit')}</option>
                <option value='false'>{i18next.t('temperature:celsius')}</option>
              </Field>
              <ErrorFor errors={errors} touched={touched} name='fahrenheit' />
            </div>
          </div>

          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='period'>{i18next.t('temperature:check_frequency')}</label>
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
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='one_shot'>{i18next.t('one_shot')}</label>
              <Field
                name='one_shot'
                component={BooleanSelect}
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('one_shot', touched, errors)
                })}
              >
                <option value='true'>{i18next.t('enabled')}</option>
                <option value='false'>{i18next.t('disabled')}</option>
              </Field>
              <ErrorFor errors={errors} touched={touched} name='one_shot' />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='chart.ymin'>{i18next.t('temperature:chart_ymin')}</label>
              <Field
                name='chart.ymin'
                readOnly={readOnly}
                type='number'
                className={classNames('form-control', {
                  'is-invalid': ShowError('chart.ymin', touched, errors)
                })}
              />
              <ErrorFor errors={errors} touched={touched} name='chart.ymin' />
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='chart.ymax'>{i18next.t('temperature:chart_ymax')}</label>
              <Field
                name='chart.ymax'
                readOnly={readOnly}
                type='number'
                className={classNames('form-control', {
                  'is-invalid': ShowError('chart.ymax', touched, errors)
                })}
              />
              <ErrorFor errors={errors} touched={touched} name='chart.ymax' />
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='chart.color'>{i18next.t('temperature:chart_color')}</label>
              <ColorPicker
                name={NameFor(values.name, 'chart.color')}
                readOnly={readOnly}
                color={values.chart.color}
                onChangeHandler={updateChartColor}
              />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='alerts'>{i18next.t('alerts')}</label>
              <Field
                name='alerts'
                component={BooleanSelect}
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('alerts', touched, errors)
                })}
              >
                <option value='true'>{i18next.t('enabled')}</option>
                <option value='false'>{i18next.t('disabled')}</option>
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
              <label htmlFor='minAlert'>{i18next.t('temperature:alert_below')}</label>
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
              <label htmlFor='maxAlert'>{i18next.t('temperature:alert_above')}</label>
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
              <label htmlFor='control'>{i18next.t('temperature:control')}</label>
              <Field
                name='control'
                component='select'
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('control', touched, errors)
                })}
              >
                <option value='nothing'>{i18next.t('temperature:controlnothing')}</option>
                <option value='macro'>{i18next.t('temperature:controlmacro')}</option>
                <option value='equipment'>{i18next.t('temperature:controlequipment')}</option>
              </Field>
              <ErrorFor errors={errors} touched={touched} name='control' />
            </div>
          </div>

          {/* Wrap to next line on small */}
          <div className='w-100 d-none d-sm-block d-md-none' />

          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='min'>{i18next.t('temperature:lower_threshold')}</label>
              <div className='input-group'>
                <Field
                  name='min'
                  readOnly={readOnly || values.control === 'nothing'}
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

          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='heater'>{i18next.t('temperature:lower_function')}</label>
              <Field
                name='heater'
                component='select'
                disabled={readOnly || values.control === 'nothing'}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('heater', touched, errors)
                })}
              >
                <option key='' value=''>{i18next.t('none')}</option>
                {controlOptions()}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='heater' />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col col-sm-6 col-md-3 offset-md-3'>
            <div className='form-group'>
              <label htmlFor='max'>{i18next.t('temperature:upper_threshold')}</label>
              <div className='input-group'>
                <Field
                  name='max'
                  readOnly={readOnly || values.control === 'nothing'}
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

          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='cooler'>{i18next.t('temperature:upper_function')}</label>
              <Field
                name='cooler'
                component='select'
                disabled={readOnly || values.control === 'nothing'}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('cooler', touched, errors)
                })}
              >
                <option key='' value=''>{i18next.t('none')}</option>
                {controlOptions()}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='cooler' />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col col-sm-6 col-md-3 offset-md-3'>
            <div className='form-group'>
              <label htmlFor='hysteresis'>{i18next.t('temperature:hysteresis')}</label>
              <div className='input-group'>
                <Field
                  name='hysteresis'
                  readOnly={readOnly || values.control === 'nothing'}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('hysteresis', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{temperatureUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='hysteresis' />
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
            value={i18next.t('save')}
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
  handleChange: PropTypes.func,
  equipment: PropTypes.array,
  macros: PropTypes.array
}

export default EditTemperature
