import React from 'react'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { Field } from 'formik'
import i18n from 'utils/i18n'
import BooleanSelect from '../ui_components/boolean_select'
import Percent from '../ui_components/percent'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

const EditDcPump = ({
  values,
  errors,
  touched,
  jacks,
  isValid,
  onBlur,
  handleChange,
  setFieldValue,
  submitForm,
  dirty,
  readOnly
}) => {
  const jackOptions = () => {
    return jacks.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }

  const pinOptions = () => {
    const selectedJack = jacks.find(j => { return j.id === values.jack })
    if (!selectedJack) { return [] }

    return selectedJack.pins.map(item => {
      return (
        <option key={item} value={item}>
          {item}
        </option>
      )
    })
  }

  const jackChanged = e => {
    setFieldValue('pin', '', false)
    handleChange(e)
  }

  return (
    <div style={formGridStyle}>
      <FormField label={i18n.t('jack')} error={ShowError('jack', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='jack' /> : undefined}>
        <Select
          name='jack'
          data-testid='smoke-doser-jack'
          onChange={jackChanged}
          onBlur={onBlur}
          disabled={readOnly}
          value={values.jack}
          invalid={ShowError('jack', touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {jackOptions()}
        </Select>
      </FormField>

      <FormField label={i18n.t('pin')} error={ShowError('pin', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='pin' /> : undefined}>
        <Select
          name='pin'
          data-testid='smoke-doser-pin'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.pin}
          invalid={ShowError('pin', touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {pinOptions()}
        </Select>
      </FormField>

      <FormField label={i18n.t('status')} error={ShowError('enable', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='enable' /> : undefined}>
        <Field
          name='enable'
          component={BooleanSelect}
          disabled={readOnly}
          invalid={ShowError('enable', touched, errors)}
        >
          <option value='true'>{i18n.t('enabled')}</option>
          <option value='false'>{i18n.t('disabled')}</option>
        </Field>
      </FormField>

      <FormField label={i18n.t('doser:continuous')}>
        <Input
          name='continuous'
          type='checkbox'
          disabled={readOnly}
          checked={values.continuous}
          onChange={handleChange}
        />
      </FormField>

      {!values.continuous && (values.volume_per_second > 0
        ? (
          <FormField label={i18n.t('doser:volume_ml')} error={ShowError('volume', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='volume' /> : undefined}>
            <div style={{ display: 'inline-flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
              <Input
                name='volume'
                readOnly={readOnly}
                type='number'
                onChange={handleChange}
                onBlur={onBlur}
                value={values.volume}
                invalid={ShowError('volume', touched, errors)}
              />
              <span>mL</span>
            </div>
            <small style={{ color: 'var(--reefpi-color-text-muted)', fontSize: '0.75rem' }}>
              {i18n.t('doser:calibration:rate')}: {parseFloat(values.volume_per_second).toFixed(3)} mL/s
            </small>
          </FormField>
          )
        : (
          <FormField label={i18n.t('doser:duration')} error={ShowError('duration', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='duration' /> : undefined}>
            <div style={{ display: 'inline-flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
              <Input
                name='duration'
                data-testid='smoke-doser-duration'
                readOnly={readOnly}
                type='number'
                onChange={handleChange}
                onBlur={onBlur}
                value={values.duration}
                invalid={ShowError('duration', touched, errors)}
              />
              <span>{i18n.t('second_s')}</span>
            </div>
          </FormField>
          )
      )}

      <FormField label={i18n.t('doser:speed')} error={ShowError('speed', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='speed' /> : undefined}>
        <div style={{ display: 'inline-flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
          <Percent
            type='number'
            data-testid='smoke-doser-speed'
            invalid={ShowError('speed', touched, errors)}
            name='speed'
            onBlur={onBlur}
            readOnly={readOnly}
            onChange={handleChange}
            value={values.speed}
          />
          <span>%</span>
        </div>
      </FormField>

      <FormField label={i18n.t('doser:soft_start')} error={ShowError('soft_start', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='soft_start' /> : undefined}>
        <div style={{ display: 'inline-flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
          <Input
            name='soft_start'
            data-testid='smoke-doser-soft-start'
            readOnly={readOnly}
            type='number'
            min='0'
            onChange={handleChange}
            onBlur={onBlur}
            value={values.soft_start}
            invalid={ShowError('soft_start', touched, errors)}
          />
          <span>{i18n.t('second_s')}</span>
        </div>
      </FormField>
    </div>
  )
}
export default EditDcPump
