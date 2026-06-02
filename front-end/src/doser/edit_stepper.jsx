import React from 'react'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18n from 'utils/i18n'
import BooleanSelect from '../ui_components/boolean_select'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

const EditStepper = ({
  values,
  errors,
  touched,
  outlets,
  isValid,
  onBlur,
  handleChange,
  setFieldValue,
  submitForm,
  dirty,
  readOnly
}) => {
  const outletOptions = () => {
    return outlets.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }
  return (
    <div style={formGridStyle}>
      <FormField label={i18n.t('doser:step_pin')} error={ShowError('stepper.step_pin', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.step_pin' /> : undefined}>
        <Select
          name='stepper.step_pin'
          data-testid='smoke-doser-step-pin'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.step_pin}
          invalid={ShowError('stepper.step_pin', touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {outletOptions()}
        </Select>
      </FormField>

      <FormField label={i18n.t('doser:direction_pin')} error={ShowError('stepper.direction_pin', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.direction_pin' /> : undefined}>
        <Select
          name='stepper.direction_pin'
          data-testid='smoke-doser-direction-pin'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.direction_pin}
          invalid={ShowError('stepper.direction_pin', touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {outletOptions()}
        </Select>
      </FormField>

      <FormField label={i18n.t('doser:ms_pin_a')} error={ShowError('stepper.ms_pin_a', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.ms_pin_a' /> : undefined}>
        <Select
          name='stepper.ms_pin_a'
          data-testid='smoke-doser-ms-pin-a'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.ms_pin_a}
          invalid={ShowError('stepper.ms_pin_a', touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {outletOptions()}
        </Select>
      </FormField>

      <FormField label={i18n.t('doser:ms_pin_b')} error={ShowError('stepper.ms_pin_b', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.ms_pin_b' /> : undefined}>
        <Select
          name='stepper.ms_pin_b'
          data-testid='smoke-doser-ms-pin-b'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.ms_pin_b}
          invalid={ShowError('stepper.ms_pin_b', touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {outletOptions()}
        </Select>
      </FormField>

      <FormField label={i18n.t('doser:ms_pin_c')} error={ShowError('stepper.ms_pin_c', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.ms_pin_c' /> : undefined}>
        <Select
          name='stepper.ms_pin_c'
          data-testid='smoke-doser-ms-pin-c'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.ms_pin_c}
          invalid={ShowError('stepper.ms_pin_c', touched, errors)}
        >
          <option value='' className='d-none'>-- {i18n.t('select')} --</option>
          {outletOptions()}
        </Select>
      </FormField>

      <FormField label={i18n.t('doser:spr')} error={ShowError('stepper.spr', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.spr' /> : undefined}>
        <Input
          name='stepper.spr'
          data-testid='smoke-doser-spr'
          disabled={readOnly}
          type='number'
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.spr}
          invalid={ShowError('stepper.spr', touched, errors)}
        />
      </FormField>

      <FormField label={i18n.t('doser:vpr')} error={ShowError('stepper.vpr', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.vpr' /> : undefined}>
        <Input
          name='stepper.vpr'
          data-testid='smoke-doser-vpr'
          disabled={readOnly}
          type='number'
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.vpr}
          invalid={ShowError('stepper.vpr', touched, errors)}
        />
      </FormField>

      <FormField label={i18n.t('doser:delay')} error={ShowError('stepper.delay', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.delay' /> : undefined}>
        <Input
          name='stepper.delay'
          data-testid='smoke-doser-delay'
          disabled={readOnly}
          type='number'
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.delay}
          invalid={ShowError('stepper.delay', touched, errors)}
        />
      </FormField>

      <FormField label={i18n.t('doser:direction')} error={ShowError('stepper.direction', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.direction' /> : undefined}>
        <Select
          name='stepper.direction'
          data-testid='smoke-doser-direction'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.direction}
          invalid={ShowError('stepper.direction', touched, errors)}
        >
          <option value='true'>{i18n.t('forward')}</option>
          <option value='false'>{i18n.t('reverse')}</option>
        </Select>
      </FormField>

      <FormField label={i18n.t('doser:microstepping')} error={ShowError('stepper.microstepping', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='stepper.microstepping' /> : undefined}>
        <Select
          name='stepper.microstepping'
          data-testid='smoke-doser-microstepping'
          disabled={readOnly}
          onChange={handleChange}
          onBlur={onBlur}
          value={values.stepper && values.stepper.microstepping}
          invalid={ShowError('stepper.microstepping', touched, errors)}
        >
          <option value='Full'>{i18n.t('doser:microstep:full')}</option>
          <option value='Half'>{i18n.t('doser:microstep:1/2')}</option>
          <option value='1/4'>{i18n.t('doser:microstep:1/4')}</option>
          <option value='1/8'>{i18n.t('doser:microstep:1/8')}</option>
          <option value='1/16'>{i18n.t('doser:microstep:1/16')}</option>
          <option value='1/32'>{i18n.t('doser:microstep:1/32')}</option>
        </Select>
      </FormField>
    </div>
  )
}
export default EditStepper
