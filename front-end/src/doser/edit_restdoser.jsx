import React from 'react'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { Field } from 'formik'
import i18n from 'utils/i18n'
import classNames from 'classnames'
import BooleanSelect from '../ui_components/boolean_select'
import i18next from 'i18next'
import Percent from '../ui_components/percent'

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
  return (
    <div className='row'>
      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label htmlFor='restdoser.url'>URL</label>
          <Field
            name='restdoser.url'
            disabled={readOnly}
            className={classNames('form-control', {
              'is-invalid': ShowError('restdoser.url', touched, errors)
            })}
          />
          <ErrorFor errors={errors} touched={touched} name='restdoser.url' />
        </div>
      </div>
      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label htmlFor='restdoser.calUrl'>{i18next.t('doser:calibrate')} URL</label>
          <Field
            name='restdoser.calUrl'
            disabled={readOnly}
            className={classNames('form-control', {
              'is-invalid': ShowError('restdoser.calUrl', touched, errors)
            })}
          />
          <ErrorFor errors={errors} touched={touched} name='restdoser.calUrl' />
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
export default EditRestDoser
