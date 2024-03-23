import React from 'react'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { Field } from 'formik'
import i18n from 'utils/i18n'
import classNames from 'classnames'
import BooleanSelect from '../ui_components/boolean_select'

const EditRestDoser = ({
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
    <div className='row'>
      <div className='col'>
        <div className='form-group'>
          <label htmlFor='step_pin'>{i18n.t('doser:step_pin')}</label>
          <Field
            name='stepper.step_pin'
            disabled={readOnly}
            component='select'
            className={classNames('custom-select', {
              'is-invalid': ShowError('stepper.step_pin', touched, errors)
            })}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            {outletOptions()}
          </Field>
          <ErrorFor errors={errors} touched={touched} name='stepper.step_pin' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='direction_pin'>{i18n.t('doser:direction_pin')}</label>
          <Field
            name='stepper.direction_pin'
            disabled={readOnly}
            component='select'
            className={classNames('custom-select', {
              'is-invalid': ShowError('stepper.direction_pin', touched, errors)
            })}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            {outletOptions()}
          </Field>
          <ErrorFor errors={errors} touched={touched} name='stepper.direction_pin' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='ms_pin_a'>{i18n.t('doser:ms_pin_a')}</label>
          <Field
            name='stepper.ms_pin_a'
            disabled={readOnly}
            component='select'
            className={classNames('custom-select', {
              'is-invalid': ShowError('stepper.ms_pin_a', touched, errors)
            })}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            {outletOptions()}
          </Field>
          <ErrorFor errors={errors} touched={touched} name='stepper.ms_pin_a' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='ms_pin_b'>{i18n.t('doser:ms_pin_b')}</label>
          <Field
            name='stepper.ms_pin_b'
            disabled={readOnly}
            component='select'
            className={classNames('custom-select', {
              'is-invalid': ShowError('stepper.ms_pin_b', touched, errors)
            })}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            {outletOptions()}
          </Field>
          <ErrorFor errors={errors} touched={touched} name='stepper.ms_pin_b' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='ms_pin_c'>{i18n.t('doser:ms_pin_c')}</label>
          <Field
            name='stepper.ms_pin_c'
            disabled={readOnly}
            component='select'
            className={classNames('custom-select', {
              'is-invalid': ShowError('stepper.ms_pin_c', touched, errors)
            })}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            {outletOptions()}
          </Field>
          <ErrorFor errors={errors} touched={touched} name='stepper.ms_pin_c' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='spr'>{i18n.t('doser:spr')}</label>
          <Field
            name='stepper.spr'
            disabled={readOnly}
            type='number'
            className={classNames('form-control', {
              'is-invalid': ShowError('stepper.spr', touched, errors)
            })}
          />
          <ErrorFor errors={errors} touched={touched} name='stepper.spr' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='vpr'>{i18n.t('doser:vpr')}</label>
          <Field
            name='stepper.vpr'
            disabled={readOnly}
            type='number'
            className={classNames('form-control', {
              'is-invalid': ShowError('stepper.vpr', touched, errors)
            })}
          />
          <ErrorFor errors={errors} touched={touched} name='stepper.vpr' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='delay'>{i18n.t('doser:delay')}</label>
          <Field
            name='stepper.delay'
            disabled={readOnly}
            type='number'
            className={classNames('form-control', {
              'is-invalid': ShowError('stepper.delay', touched, errors)
            })}
          />
          <ErrorFor errors={errors} touched={touched} name='stepper.vpr' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='direction'>{i18n.t('doser:direction')}</label>
          <Field
            name='stepper.direction'
            disabled={readOnly}
            component={BooleanSelect}
            className={classNames('custom-select', {
              'is-invalid': ShowError('stepper.direction', touched, errors)
            })}
          >
            <option value='true'>{i18n.t('forward')}</option>
            <option value='false'>{i18n.t('reverse')}</option>
          </Field>
          <ErrorFor errors={errors} touched={touched} name='stepper.direction' />
        </div>
      </div>

      <div className='col'>
        <div className='form-group'>
          <label htmlFor='microstepping'>{i18n.t('doser:microstepping')}</label>
          <Field
            name='stepper.microstepping'
            disabled={readOnly}
            component='select'
            className={classNames('custom-select', {
              'is-invalid': ShowError('stepper.microstepping', touched, errors)
            })}
          >
            <option value='Full'>{i18n.t('doser:microstep:full')}</option>
            <option value='Half'>{i18n.t('doser:microstep:1/2')}</option>
            <option value='1/4'>{i18n.t('doser:microstep:1/4')}</option>
            <option value='1/8'>{i18n.t('doser:microstep:1/8')}</option>
            <option value='1/16'>{i18n.t('doser:microstep:1/16')}</option>
            <option value='1/32'>{i18n.t('doser:microstep:1/32')}</option>
          </Field>
          <ErrorFor errors={errors} touched={touched} name='stepper.microstepping' />
        </div>
      </div>

    </div>
  )
}
export default EditRestDoser
