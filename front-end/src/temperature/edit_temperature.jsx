import React from 'react'
import PropTypes from 'prop-types'
import ColorPicker from '../ui_components/color_picker'
import { NameFor, ErrorFor, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import ReadingsChart from './readings_chart'
import ControlChart from './control_chart'
import i18next from 'i18next'

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

const EditTemperature = ({
  values,
  errors,
  touched,
  sensors,
  analogInputs,
  equipment,
  macros,
  submitForm,
  isValid,
  dirty,
  readOnly,
  showChart,
  handleBlur,
  handleChange
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18next.t('validation:error'))
    }
  }

  const updateChartColor = (e) => {
    values.chart.color = e.target.value
  }

  const temperatureUnit = () => {
    return values.fahrenheit === true || values.fahrenheit === 'true'
      ? '℉'
      : '℃'
  }

  const charts = () => {
    if (!showChart || !values.enable) {
      return
    }

    let chs = (
      <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
        <ReadingsChart sensor_id={values.id} width={500} height={300} />
      </div>
    )

    if ((values.heater !== undefined && values.heater !== '') || (values.cooler !== undefined && values.cooler !== '')) {
      chs = (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
          <ReadingsChart sensor_id={values.id} width={500} height={300} />
          <ControlChart sensor_id={values.id} width={500} height={300} />
        </div>
      )
    }

    return chs
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

  const analogInputOptions = () => {
    if (!analogInputs) return null
    return analogInputs.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
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
        {!readOnly && (
          <div style={{ ...gridStyle, marginBottom: 'var(--reefpi-space-md)' }}>
            <FormField
              label={i18next.t('name')}
              error={ShowError('name', touched, errors) ? ErrorFor(errors, 'name') : undefined}
            >
              <Input
                name='name'
                data-testid='smoke-temperature-name'
                disabled={readOnly}
                value={values.name || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('name', touched, errors)}
              />
            </FormField>
          </div>
        )}

        <div style={gridStyle}>
          <FormField
            label={i18next.t('temperature:sensor')}
            error={ShowError('sensor', touched, errors) ? ErrorFor(errors, 'sensor') : undefined}
          >
            <Select
              name='sensor'
              data-testid='smoke-temperature-sensor'
              disabled={readOnly || values.analog_input !== ''}
              value={values.sensor || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('sensor', touched, errors)}
            >
              <option value=''>
                -- {i18next.t('select')} --
              </option>
              {sensorOptions()}
            </Select>
          </FormField>

          <FormField
            label={i18next.t('temperature:analog_input')}
            error={ShowError('analog_input', touched, errors) ? ErrorFor(errors, 'analog_input') : undefined}
          >
            <Select
              name='analog_input'
              disabled={readOnly || values.sensor !== ''}
              value={values.analog_input || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('analog_input', touched, errors)}
            >
              <option value=''>
                {i18next.t('none')}
              </option>
              {analogInputOptions()}
            </Select>
          </FormField>

          <FormField
            label={i18next.t('temperature:unit')}
            error={ShowError('fahrenheit', touched, errors) ? ErrorFor(errors, 'fahrenheit') : undefined}
          >
            <Select
              name='fahrenheit'
              disabled={readOnly}
              value={String(values.fahrenheit)}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('fahrenheit', touched, errors)}
            >
              <option value='true'>{i18next.t('temperature:fahrenheit')}</option>
              <option value='false'>{i18next.t('temperature:celsius')}</option>
            </Select>
          </FormField>

          <FormField
            label={i18next.t('temperature:check_frequency')}
            error={ShowError('period', touched, errors) ? ErrorFor(errors, 'period') : undefined}
            helpText={i18next.t('second_s')}
          >
            <Input
              name='period'
              data-testid='smoke-temperature-period'
              readOnly={readOnly}
              type='number'
              value={values.period || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('period', touched, errors)}
            />
          </FormField>

          <FormField
            label={i18next.t('status')}
            error={ShowError('enable', touched, errors) ? ErrorFor(errors, 'enable') : undefined}
          >
            <Select
              name='enable'
              disabled={readOnly}
              value={String(values.enable)}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('enable', touched, errors)}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Select>
          </FormField>
        </div>

        <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
          <FormField
            label={i18next.t('one_shot')}
            error={ShowError('one_shot', touched, errors) ? ErrorFor(errors, 'one_shot') : undefined}
          >
            <Select
              name='one_shot'
              disabled={readOnly}
              value={String(values.one_shot)}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('one_shot', touched, errors)}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Select>
          </FormField>

          <FormField
            label={i18next.t('temperature:fail_safe')}
            error={ShowError('fail_safe', touched, errors) ? ErrorFor(errors, 'fail_safe') : undefined}
          >
            <Select
              name='fail_safe'
              disabled={readOnly}
              value={String(values.fail_safe)}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('fail_safe', touched, errors)}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Select>
          </FormField>
        </div>

        <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
          <FormField
            label={i18next.t('temperature:chart_ymin')}
            error={ShowError('chart.ymin', touched, errors) ? ErrorFor(errors, 'chart.ymin') : undefined}
          >
            <Input
              name='chart.ymin'
              readOnly={readOnly}
              type='number'
              value={values.chart ? values.chart.ymin : ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('chart.ymin', touched, errors)}
            />
          </FormField>
          <FormField
            label={i18next.t('temperature:chart_ymax')}
            error={ShowError('chart.ymax', touched, errors) ? ErrorFor(errors, 'chart.ymax') : undefined}
          >
            <Input
              name='chart.ymax'
              readOnly={readOnly}
              type='number'
              value={values.chart ? values.chart.ymax : ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('chart.ymax', touched, errors)}
            />
          </FormField>
          <FormField label={i18next.t('temperature:chart_color')}>
            <ColorPicker
              name={NameFor(values.name, 'chart.color')}
              readOnly={readOnly}
              color={values.chart ? values.chart.color : ''}
              onChangeHandler={updateChartColor}
            />
          </FormField>
        </div>

        <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
          <FormField
            label={i18next.t('alerts')}
            error={ShowError('alerts', touched, errors) ? ErrorFor(errors, 'alerts') : undefined}
          >
            <Select
              name='alerts'
              disabled={readOnly}
              value={String(values.alerts)}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('alerts', touched, errors)}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Select>
          </FormField>

          {values.alerts !== false && (
            <FormField
              label={i18next.t('temperature:alert_below')}
              error={ShowError('minAlert', touched, errors) ? ErrorFor(errors, 'minAlert') : undefined}
              helpText={temperatureUnit()}
            >
              <Input
                name='minAlert'
                type='number'
                readOnly={readOnly || values.alerts === false}
                value={values.minAlert || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('minAlert', touched, errors)}
              />
            </FormField>
          )}

          {values.alerts !== false && (
            <FormField
              label={i18next.t('temperature:alert_above')}
              error={ShowError('maxAlert', touched, errors) ? ErrorFor(errors, 'maxAlert') : undefined}
              helpText={temperatureUnit()}
            >
              <Input
                name='maxAlert'
                type='number'
                readOnly={readOnly || values.alerts === false}
                value={values.maxAlert || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('maxAlert', touched, errors)}
              />
            </FormField>
          )}
        </div>

        <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
          <FormField
            label={i18next.t('temperature:control')}
            error={ShowError('control', touched, errors) ? ErrorFor(errors, 'control') : undefined}
          >
            <Select
              name='control'
              data-testid='smoke-temperature-control'
              disabled={readOnly}
              value={values.control || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('control', touched, errors)}
            >
              <option value=''>{i18next.t('temperature:controlnothing')}</option>
              <option value='macro'>{i18next.t('temperature:controlmacro')}</option>
              <option value='equipment'>{i18next.t('temperature:controlequipment')}</option>
            </Select>
          </FormField>

          <FormField
            label={i18next.t('temperature:lower_function')}
            error={ShowError('heater', touched, errors) ? ErrorFor(errors, 'heater') : undefined}
          >
            <Select
              name='heater'
              data-testid='smoke-temperature-heater'
              disabled={readOnly || values.control === ''}
              value={values.heater || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('heater', touched, errors)}
            >
              <option value=''>{i18next.t('temperature:controlnothing')}</option>
              {controlOptions()}
            </Select>
          </FormField>

          <FormField
            label={i18next.t('temperature:lower_threshold')}
            error={ShowError('min', touched, errors) ? ErrorFor(errors, 'min') : undefined}
            helpText={temperatureUnit()}
          >
            <Input
              name='min'
              data-testid='smoke-temperature-min'
              readOnly={readOnly || values.control === '' || values.heater === undefined || values.heater === ''}
              value={values.min || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('min', touched, errors)}
            />
          </FormField>
        </div>

        <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
          <FormField
            label={i18next.t('temperature:upper_function')}
            error={ShowError('cooler', touched, errors) ? ErrorFor(errors, 'cooler') : undefined}
          >
            <Select
              name='cooler'
              data-testid='smoke-temperature-cooler'
              disabled={readOnly || values.control === ''}
              value={values.cooler || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('cooler', touched, errors)}
            >
              <option value=''>{i18next.t('temperature:controlnothing')}</option>
              {controlOptions()}
            </Select>
          </FormField>

          <FormField
            label={i18next.t('temperature:upper_threshold')}
            error={ShowError('max', touched, errors) ? ErrorFor(errors, 'max') : undefined}
            helpText={temperatureUnit()}
          >
            <Input
              name='max'
              data-testid='smoke-temperature-max'
              readOnly={readOnly || values.control === '' || values.cooler === undefined || values.cooler === ''}
              value={values.max || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('max', touched, errors)}
            />
          </FormField>
        </div>

        <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
          <FormField
            label={i18next.t('temperature:hysteresis')}
            error={ShowError('hysteresis', touched, errors) ? ErrorFor(errors, 'hysteresis') : undefined}
            helpText={temperatureUnit()}
          >
            <Input
              name='hysteresis'
              readOnly={readOnly || values.control === ''}
              value={values.hysteresis || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              invalid={ShowError('hysteresis', touched, errors)}
            />
          </FormField>
        </div>

        {charts()}
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-xs)' }}>
          <Button
            type='submit'
            data-testid='smoke-temperature-submit'
            variant='primary'
            disabled={readOnly}
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18next.t('save')}
          </Button>
        </div>
      )}
    </form>
  )
}

EditTemperature.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  sensors: PropTypes.array,
  analogInputs: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func,
  equipment: PropTypes.array,
  macros: PropTypes.array
}

export default EditTemperature
