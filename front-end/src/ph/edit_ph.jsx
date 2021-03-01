import React from 'react'
import ColorPicker from '../ui_components/color_picker'
import PropTypes from 'prop-types'
import { NameFor, ErrorFor, ShowError } from '../utils/validation_helper'
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
  equipment,
  macros,
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

  const updateChartColor = (e) => {
    values.chart.color = e.target.value
  }

  const options = () => {
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
            <label htmlFor='chart.ymin'>{i18next.t('ph:chart_ymin')}</label>
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
            <label htmlFor='chart.ymax'>{i18next.t('ph:chart_ymax')}</label>
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
            <label htmlFor='chart.unit'>{i18next.t('ph:chart_unit')}</label>
            <Field
              name='chart.unit'
              readOnly={readOnly}
              type='string'
              className={classNames('form-control', {
                'is-invalid': ShowError('chart.unit', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='chart.unit' />
          </div>
        </div>

        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='chart.color'>{i18next.t('ph:chart_color')}</label>
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

        {/* Wrap to next line on small */}
        <div className='w-100 d-none d-sm-block d-md-none' />

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

      <div className='row'>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='control'>{i18next.t('ph:control')}</label>
            <Field
              name='control'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('control', touched, errors)
              })}
            >
              <option value='nothing'>{i18next.t('ph:controlnothing')}</option>
              <option value='macro'>{i18next.t('ph:controlmacro')}</option>
              <option value='equipment'>{i18next.t('ph:controlequipment')}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='control' />
          </div>
        </div>

        {/* Wrap to next line on small */}
        <div className='w-100 d-none d-sm-block d-md-none' />

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='lowerThreshold'>{i18next.t('ph:lower_threshold')}</label>
            <Field
              name='lowerThreshold'
              readOnly={readOnly || values.control === 'nothing'}
              className={classNames('form-control', {
                'is-invalid': ShowError('lowerThreshold', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='lowerThreshold' />
          </div>
        </div>

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='lowerFunction'>{i18next.t('ph:lower_function')}</label>
            <Field
              name='lowerFunction'
              component='select'
              disabled={readOnly || values.control === 'nothing'}
              className={classNames('custom-select', {
                'is-invalid': ShowError('lowerFunction', touched, errors)
              })}
            >
              <option value='' className='d-none'>-- {i18next.t('select')} --</option>
              {options()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='lowerFunction' />
          </div>
        </div>
      </div>

      <div className='row'>

        <div className='col col-sm-6 col-md-3 offset-md-3'>
          <div className='form-group'>
            <label htmlFor='upperThreshold'>{i18next.t('ph:upper_threshold')}</label>
            <Field
              name='upperThreshold'
              readOnly={readOnly || values.control === 'nothing'}
              className={classNames('form-control', {
                'is-invalid': ShowError('upperThreshold', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='upperThreshold' />
          </div>
        </div>

        <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='upperFunction'>{i18next.t('ph:upper_function')}</label>
            <Field
              name='upperFunction'
              component='select'
              disabled={readOnly || values.control === 'nothing'}
              className={classNames('custom-select', {
                'is-invalid': ShowError('upperFunction', touched, errors)
              })}
            >
              <option value='' className='d-none'>-- {i18next.t('select')} --</option>
              {options()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='upperFunction' />
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col col-sm-6 col-md-3 offset-md-3'>
          <div className='form-group'>
            <label htmlFor='hysteresis'>{i18next.t('ph:hysteresis')}</label>
            <Field
              name='hysteresis'
              readOnly={readOnly || values.control === 'nothing'}
              className={classNames('form-control', {
                'is-invalid': ShowError('hysteresis', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='hysteresis' />
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
  analogInputs: PropTypes.array,
  equipment: PropTypes.array,
  macros: PropTypes.array,
  probe: PropTypes.object,
  isValid: PropTypes.bool,
  dirty: PropTypes.bool,
  readOnly: PropTypes.bool
}

export default EditPh
