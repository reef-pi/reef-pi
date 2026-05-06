import React from 'react'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { Field } from 'formik'
import i18n from 'utils/i18n'
import classNames from 'classnames'

const LightningProfile = ({
  config,
  errors,
  touched,
  readOnly,
  onChangeHandler
}) => {
  const handleChange = e => {
    const updated = { ...config, [e.target.name]: e.target.value }
    onChangeHandler(updated)
  }

  const val = (key, fallback) => (config && config[key] !== undefined ? config[key] : fallback)

  return (
    <div className='row'>
      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label>{i18n.t('start_time')}</label>
          <Field
            name='config.start'
            readOnly={readOnly}
            placeholder='HH:mm:ss'
            value={val('start', '')}
            onChange={handleChange}
            className={classNames('form-control', {
              'is-invalid': ShowError('config.start', touched, errors)
            })}
          />
          <ErrorFor errors={errors} touched={touched} name='config.start' />
        </div>
      </div>

      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label>{i18n.t('end_time')}</label>
          <Field
            name='config.end'
            readOnly={readOnly}
            placeholder='HH:mm:ss'
            value={val('end', '')}
            onChange={handleChange}
            className={classNames('form-control', {
              'is-invalid': ShowError('config.end', touched, errors)
            })}
          />
          <ErrorFor errors={errors} touched={touched} name='config.end' />
        </div>
      </div>

      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label>{i18n.t('lighting:lightning_frequency')}</label>
          <div className='input-group'>
            <Field
              name='config.frequency'
              type='number'
              readOnly={readOnly}
              value={val('frequency', 2)}
              onChange={handleChange}
              className={classNames('form-control', {
                'is-invalid': ShowError('config.frequency', touched, errors)
              })}
            />
            <div className='input-group-append'>
              <span className='input-group-text'>/min</span>
            </div>
          </div>
          <ErrorFor errors={errors} touched={touched} name='config.frequency' />
        </div>
      </div>

      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label>{i18n.t('lighting:lightning_flash_slot')}</label>
          <div className='input-group'>
            <Field
              name='config.flash_slot'
              type='number'
              readOnly={readOnly}
              value={val('flash_slot', 1)}
              onChange={handleChange}
              className={classNames('form-control', {
                'is-invalid': ShowError('config.flash_slot', touched, errors)
              })}
            />
            <div className='input-group-append'>
              <span className='input-group-text'>{i18n.t('sec')}</span>
            </div>
          </div>
          <ErrorFor errors={errors} touched={touched} name='config.flash_slot' />
        </div>
      </div>

      <div className='col-12 col-sm-6 col-md-3'>
        <div className='form-group'>
          <label>{i18n.t('lighting:lightning_intensity')}</label>
          <div className='input-group'>
            <Field
              name='config.intensity'
              type='number'
              readOnly={readOnly}
              value={val('intensity', 100)}
              onChange={handleChange}
              className={classNames('form-control', {
                'is-invalid': ShowError('config.intensity', touched, errors)
              })}
            />
            <div className='input-group-append'>
              <span className='input-group-text'>%</span>
            </div>
          </div>
          <ErrorFor errors={errors} touched={touched} name='config.intensity' />
        </div>
      </div>
    </div>
  )
}

export default LightningProfile
