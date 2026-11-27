import React from 'react'
import PropTypes from 'prop-types'
import { ErrorMessage, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import BooleanFormSelect from '../ui_components/boolean_form_select'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import i18next from 'i18next'
import ATOChart from './chart'

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

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
  readOnly,
  onCancel,
  handleBlur,
  handleChange
}) => {
  const charts = () => {
    if (!values.enable) {
      return
    }
    if (values.id === '') { // new ATO
      return
    }
    return (
      <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
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
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        i18next.t('validation:error')
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
    <form className='reefpi-controller-form' onSubmit={handleSubmit}>
      <div className='reefpi-controller-form__sections'>
        <section className='reefpi-section-card' aria-label={i18next.t('ato:sensor_timing', { defaultValue: 'Sensor & timing' })}>
          <div className='reefpi-controller-section__header'>
            <h3>{i18next.t('ato:sensor_timing', { defaultValue: 'Sensor & timing' })}</h3>
            <p>{i18next.t('ato:helper_sensor', { defaultValue: 'Choose the water-level inlet and how reef-pi filters repeated readings.' })}</p>
          </div>
          {!readOnly && (
            <div style={{ ...gridStyle, marginBottom: 'var(--reefpi-space-md)' }}>
              <FormField
                label={i18next.t('name')}
                error={ShowError('name', touched, errors) ? ErrorMessage(errors, 'name') : undefined}
              >
                <Input
                  name='name'
                  data-testid='smoke-ato-name'
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
              label={i18next.t('inlet')}
              error={ShowError('inlet', touched, errors) ? ErrorMessage(errors, 'inlet') : undefined}
            >
              <Select
                name='inlet'
                data-testid='smoke-ato-inlet'
                disabled={readOnly}
                value={values.inlet || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('inlet', touched, errors)}
              >
                <option value=''>
                  -- {i18next.t('select')} --
                </option>
                {inletOptions()}
              </Select>
            </FormField>

            <FormField
              label={i18next.t('ato:chk_freq')}
              error={ShowError('period', touched, errors) ? ErrorMessage(errors, 'period') : undefined}
              helpText={i18next.t('second_s')}
            >
              <Input
                name='period'
                data-testid='smoke-ato-period'
                readOnly={readOnly}
                type='number'
                value={values.period || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('period', touched, errors)}
              />
            </FormField>

            <FormField
              label={i18next.t('ato:debounce')}
              error={ShowError('debounce', touched, errors) ? ErrorMessage(errors, 'debounce') : undefined}
              helpText={i18next.t('second_s')}
            >
              <Input
                name='debounce'
                readOnly={readOnly}
                type='number'
                min='0'
                value={values.debounce || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('debounce', touched, errors)}
              />
            </FormField>

            <FormField
              label={i18next.t('status')}
              error={ShowError('enable', touched, errors) ? ErrorMessage(errors, 'enable') : undefined}
            >
              <BooleanFormSelect
                name='enable'
                disabled={readOnly}
                value={values.enable}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('enable', touched, errors)}
              >
                <option value='true'>{i18next.t('enabled')}</option>
                <option value='false'>{i18next.t('disabled')}</option>
              </BooleanFormSelect>
            </FormField>
          </div>
        </section>

        <section className='reefpi-section-card' aria-label={i18next.t('ato:pump_control', { defaultValue: 'Pump control' })}>
          <div className='reefpi-controller-section__header'>
            <h3>{i18next.t('ato:pump_control', { defaultValue: 'Pump control' })}</h3>
            <p>{i18next.t('ato:helper_pump', { defaultValue: 'Choose what reef-pi commands when the inlet requests top-off. The target stays unavailable until a control type is selected.' })}</p>
          </div>
          <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
            <FormField
              label={i18next.t('ato:control')}
              error={ShowError('control', touched, errors) ? ErrorMessage(errors, 'control') : undefined}
            >
              <Select
                name='control'
                data-testid='smoke-ato-control'
                disabled={readOnly}
                value={values.control || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('control', touched, errors)}
              >
                <option value=''>{i18next.t('ato:controlnothing')}</option>
                <option value='macro'>{i18next.t('ato:controlmacro')}</option>
                <option value='equipment'>{i18next.t('ato:controlequipment')}</option>
              </Select>
            </FormField>

            <FormField
              label={i18next.t('ato:control_target')}
              error={ShowError('pump', touched, errors) ? ErrorMessage(errors, 'pump') : undefined}
            >
              <Select
                name='pump'
                data-testid='smoke-ato-pump'
                disabled={readOnly || values.control === ''}
                value={values.pump || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('pump', touched, errors)}
              >
                <option key='' value=''>
                  {i18next.t('none')}
                </option>
                {controlOptions()}
              </Select>
            </FormField>

            <FormField
              label={i18next.t('one_shot')}
              error={ShowError('one_shot', touched, errors) ? ErrorMessage(errors, 'one_shot') : undefined}
            >
              <BooleanFormSelect
                name='one_shot'
                disabled={readOnly}
                value={values.one_shot}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('one_shot', touched, errors)}
              >
                <option value='true'>{i18next.t('enabled')}</option>
                <option value='false'>{i18next.t('disabled')}</option>
              </BooleanFormSelect>
            </FormField>
          </div>
        </section>

        <section className='reefpi-section-card' aria-label={i18next.t('ato:safety_alerts', { defaultValue: 'Safety & alerts' })}>
          <div className='reefpi-controller-section__header'>
            <h3>{i18next.t('ato:safety_alerts', { defaultValue: 'Safety & alerts' })}</h3>
            <p>{i18next.t('ato:helper_safety', { defaultValue: 'Alerts use accumulated pump-on time. Disable on alert stops this controller after that alert threshold is reached.' })}</p>
          </div>
          <div style={{ ...gridStyle, marginTop: 'var(--reefpi-space-md)' }}>
            <FormField
              label={i18next.t('alerts')}
              error={ShowError('notify', touched, errors) ? ErrorMessage(errors, 'notify') : undefined}
            >
              <BooleanFormSelect
                name='notify'
                disabled={readOnly}
                value={values.notify}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('notify', touched, errors)}
              >
                <option value='true'>{i18next.t('enabled')}</option>
                <option value='false'>{i18next.t('disabled')}</option>
              </BooleanFormSelect>
            </FormField>

            {values.notify !== false && (
              <FormField
                label={i18next.t('ato:alert_after')}
                error={ShowError('maxAlert', touched, errors) ? ErrorMessage(errors, 'maxAlert') : undefined}
                helpText={i18next.t('second_s')}
              >
                <Input
                  title={i18next.t('ato:total_seconds_pump_on')}
                  name='maxAlert'
                  type='number'
                  readOnly={readOnly || values.notify === false}
                  value={values.maxAlert || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={ShowError('maxAlert', touched, errors)}
                />
              </FormField>
            )}

            <FormField
              label={i18next.t('ato:disable_on_alert')}
              error={ShowError('disable_on_alert', touched, errors) ? ErrorMessage(errors, 'disable_on_alert') : undefined}
            >
              <BooleanFormSelect
                name='disable_on_alert'
                disabled={readOnly}
                value={values.disable_on_alert}
                onChange={handleChange}
                onBlur={handleBlur}
                invalid={ShowError('disable_on_alert', touched, errors)}
              >
                <option value='true'>{i18next.t('enabled')}</option>
                <option value='false'>{i18next.t('disabled')}</option>
              </BooleanFormSelect>
            </FormField>
          </div>
        </section>
      </div>

      {!readOnly && (
        <div className='reefpi-controller-form__actions'>
          {onCancel && (
            <Button
              type='button'
              name='cancel'
              variant='secondary'
              onClick={onCancel}
            >
              {i18next.t('cancel')}
            </Button>
          )}
          <Button
            type='submit'
            data-testid='smoke-ato-submit'
            variant={dirty ? 'primary' : 'secondary'}
            disabled={readOnly}
          >
            {i18next.t('save')}
          </Button>
        </div>
      )}

      {charts()}
    </form>
  )
}

EditAto.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  inlets: PropTypes.array,
  equipment: PropTypes.array,
  macros: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onCancel: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditAto
