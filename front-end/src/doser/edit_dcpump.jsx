import React from 'react'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { Field } from 'formik'
import i18n from 'utils/i18n'
import classNames from 'classnames'
import BooleanSelect from '../ui_components/boolean_select'
import Percent from '../ui_components/percent'

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
    <div className='row'>
      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label htmlFor='jack'>{i18n.t('jack')}</label>
          <Field
            name='jack'
            component='select'
            onChange={jackChanged}
            disabled={readOnly}
            className={classNames('custom-select', {
              'is-invalid': ShowError('jack', touched, errors)
            })}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            {jackOptions()}
          </Field>
          <ErrorFor errors={errors} touched={touched} name='jack' />
        </div>
      </div>

      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label htmlFor='pin'>{i18n.t('pin')}</label>
          <Field
            name='pin'
            component='select'
            disabled={readOnly}
            className={classNames('custom-select', {
              'is-invalid': ShowError('pin', touched, errors)
            })}
          >
            <option value='' className='d-none'>-- {i18n.t('select')} --</option>
            {pinOptions()}
          </Field>
          <ErrorFor errors={errors} touched={touched} name='pin' />
        </div>
      </div>

      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label htmlFor='enable'>{i18n.t('status')}</label>
          <Field
            name='enable'
            component={BooleanSelect}
            disabled={readOnly}
            className={classNames('custom-select', {
              'is-invalid': ShowError('enable', touched, errors)
            })}
          >
            <option value='true'>{i18n.t('enabled')}</option>
            <option value='false'>{i18n.t('disabled')}</option>
          </Field>
          <ErrorFor errors={errors} touched={touched} name='enable' />
        </div>
      </div>
      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label htmlFor='duration'>{i18n.t('doser:duration')}</label>
          <div className='input-group'>
            <Field
              name='duration'
              readOnly={readOnly}
              type='number'
              className={classNames('form-control', {
                'is-invalid': ShowError('duration', touched, errors)
              })}
            />
            <div className='input-group-append'>
              <span className='input-group-text d-none d-lg-flex'>
                {i18n.t('second_s')}
              </span>
              <span className='input-group-text d-flex d-lg-none'>sec</span>
            </div>
            <ErrorFor errors={errors} touched={touched} name='duration' />
          </div>
        </div>
      </div>

      <div className='col col-sm-6 col-md-3'>
        <div className='form-group'>
          <label htmlFor='speed'>{i18n.t('doser:speed')}</label>
          <div className='input-group'>
            <Percent
              type='number'
              className={classNames('form-control', {
                'is-invalid': ShowError('speed', touched, errors)
              })}
              name='speed'
              onBlur={onBlur}
              readOnly={readOnly}
              onChange={handleChange}
              value={values.speed}
            />
            <div className='input-group-append'>
              <span className='input-group-text'>
                %
              </span>
            </div>
            <ErrorFor errors={errors} touched={touched} name='speed' />
          </div>
        </div>
      </div>
    </div>
  )
}
export default EditDcPump
