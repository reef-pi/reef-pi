import React from 'react'
import ColorPicker from '../ui_components/color_picker'
import PropTypes from 'prop-types'
import { NameFor, ErrorFor, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import Chart from './chart'
import i18next from 'i18next'

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

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
  readOnly,
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
        <Chart probe_id={probe.id} width={500} height={300} type='current' />
        <Chart probe_id={probe.id} width={500} height={300} type='historical' />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {!readOnly && (
        <div style={{ ...gridStyle, marginBottom: 'var(--reefpi-space-md)' }}>
          <FormField
            label={i18next.t('name')}
            error={ShowError('name', touched, errors) ? ErrorFor(errors, 'name') : undefined}
          >
            <Input
              name='name'
              data-testid='smoke-ph-name'
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
          label={i18next.t('analog_input')}
          error={ShowError('analog_input', touched, errors) ? ErrorFor(errors, 'analog_input') : undefined}
        >
          <Select
            name='analog_input'
            data-testid='smoke-ph-analog-input'
            disabled={readOnly}
            value={values.analog_input || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('analog_input', touched, errors)}
          >
            <option value=''>
              -- {i18next.t('select')} --
            </option>
            {analogInputOptions()}
          </Select>
        </FormField>

        <FormField
          label={i18next.t('ph:chart_unit')}
          error={ShowError('chart.unit', touched, errors) ? ErrorFor(errors, 'chart.unit') : undefined}
        >
          <Input
            name='chart.unit'
            readOnly={readOnly}
            type='string'
            value={values.chart ? values.chart.unit || '' : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('chart.unit', touched, errors)}
          />
        </FormField>

        <FormField
          label={i18next.t('ph:check_frequency')}
          error={ShowError('period', touched, errors) ? ErrorFor(errors, 'period') : undefined}
          helpText={i18next.t('second_s')}
        >
          <Input
            name='period'
            data-testid='smoke-ph-period'
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
      </div>

      <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
        <FormField
          label={i18next.t('ph:chart_ymin')}
          error={ShowError('chart.ymin', touched, errors) ? ErrorFor(errors, 'chart.ymin') : undefined}
        >
          <Input
            name='chart.ymin'
            readOnly={readOnly}
            type='number'
            value={values.chart ? values.chart.ymin || '' : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('chart.ymin', touched, errors)}
          />
        </FormField>
        <FormField
          label={i18next.t('ph:chart_ymax')}
          error={ShowError('chart.ymax', touched, errors) ? ErrorFor(errors, 'chart.ymax') : undefined}
        >
          <Input
            name='chart.ymax'
            readOnly={readOnly}
            type='number'
            value={values.chart ? values.chart.ymax || '' : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('chart.ymax', touched, errors)}
          />
        </FormField>

        <FormField label={i18next.t('ph:chart_color')}>
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
          error={ShowError('notify', touched, errors) ? ErrorFor(errors, 'notify') : undefined}
        >
          <Select
            name='notify'
            disabled={readOnly}
            value={String(values.notify)}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('notify', touched, errors)}
          >
            <option value='true'>{i18next.t('enabled')}</option>
            <option value='false'>{i18next.t('disabled')}</option>
          </Select>
        </FormField>

        <FormField
          label={i18next.t('ph:alert_below')}
          error={ShowError('minAlert', touched, errors) ? ErrorFor(errors, 'minAlert') : undefined}
          helpText={values.chart ? values.chart.unit : undefined}
        >
          <Input
            name='minAlert'
            readOnly={readOnly || values.notify === false}
            value={values.minAlert || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('minAlert', touched, errors)}
          />
        </FormField>

        <FormField
          label={i18next.t('ph:alert_above')}
          error={ShowError('maxAlert', touched, errors) ? ErrorFor(errors, 'maxAlert') : undefined}
          helpText={values.chart ? values.chart.unit : undefined}
        >
          <Input
            name='maxAlert'
            readOnly={readOnly || values.notify === false}
            value={values.maxAlert || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('maxAlert', touched, errors)}
          />
        </FormField>
      </div>

      <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
        <FormField
          label={i18next.t('ph:control')}
          error={ShowError('control', touched, errors) ? ErrorFor(errors, 'control') : undefined}
        >
          <Select
            name='control'
            data-testid='smoke-ph-control'
            disabled={readOnly}
            value={values.control || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('control', touched, errors)}
          >
            <option value=''>{i18next.t('ph:controlnothing')}</option>
            <option value='macro'>{i18next.t('ph:controlmacro')}</option>
            <option value='equipment'>{i18next.t('ph:controlequipment')}</option>
          </Select>
        </FormField>

        <FormField
          label={i18next.t('ph:upper_threshold')}
          error={ShowError('upperThreshold', touched, errors) ? ErrorFor(errors, 'upperThreshold') : undefined}
          helpText={values.chart ? values.chart.unit : undefined}
        >
          <Input
            name='upperThreshold'
            data-testid='smoke-ph-upper-threshold'
            readOnly={readOnly || values.control === '' || values.lowerFunction === undefined || values.lowerFunction === ''}
            value={values.upperThreshold || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('upperThreshold', touched, errors)}
          />
        </FormField>

        <FormField
          label={i18next.t('ph:upper_function')}
          error={ShowError('upperFunction', touched, errors) ? ErrorFor(errors, 'upperFunction') : undefined}
        >
          <Select
            name='upperFunction'
            data-testid='smoke-ph-upper-function'
            disabled={readOnly || values.control === ''}
            value={values.upperFunction || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('upperFunction', touched, errors)}
          >
            <option value=''>{i18next.t('ph:controlnothing')}</option>
            {options()}
          </Select>
        </FormField>
      </div>

      <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
        <FormField
          label={i18next.t('ph:lower_threshold')}
          error={ShowError('lowerThreshold', touched, errors) ? ErrorFor(errors, 'lowerThreshold') : undefined}
          helpText={values.chart ? values.chart.unit : undefined}
        >
          <Input
            name='lowerThreshold'
            data-testid='smoke-ph-lower-threshold'
            readOnly={readOnly || values.control === '' || values.upperFunction === undefined || values.upperFunction === ''}
            value={values.lowerThreshold || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('lowerThreshold', touched, errors)}
          />
        </FormField>

        <FormField
          label={i18next.t('ph:lower_function')}
          error={ShowError('lowerFunction', touched, errors) ? ErrorFor(errors, 'lowerFunction') : undefined}
        >
          <Select
            name='lowerFunction'
            data-testid='smoke-ph-lower-function'
            disabled={readOnly || values.control === ''}
            value={values.lowerFunction || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('lowerFunction', touched, errors)}
          >
            <option value=''>{i18next.t('ph:controlnothing')}</option>
            {options()}
          </Select>
        </FormField>
      </div>

      <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
        <FormField
          label={i18next.t('ph:hysteresis')}
          error={ShowError('hysteresis', touched, errors) ? ErrorFor(errors, 'hysteresis') : undefined}
          helpText={values.chart ? values.chart.unit : undefined}
        >
          <Input
            name='hysteresis'
            readOnly={readOnly || values.control === '' ||
                     values.lowerFunction === undefined || values.lowerFunction === '' ||
                     values.upperFunction === undefined || values.upperFunction === ''}
            value={values.hysteresis || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('hysteresis', touched, errors)}
          />
        </FormField>

        <FormField
          label={i18next.t('ph:transformer')}
          error={ShowError('transformer', touched, errors) ? ErrorFor(errors, 'transformer') : undefined}
        >
          <Input
            name='transformer'
            disabled={readOnly}
            value={values.transformer || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('transformer', touched, errors)}
          />
        </FormField>
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-xs)' }}>
          <Button
            type='submit'
            data-testid='smoke-ph-submit'
            variant='primary'
            disabled={readOnly}
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18next.t('save')}
          </Button>
        </div>
      )}
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
