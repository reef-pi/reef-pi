import React from 'react'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { Field } from 'formik'
import i18n from 'utils/i18n'
import classNames from 'classnames'

const inputStyle = { padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)', width: '100%' }

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
      <div>
        <label>{i18n.t('start_time')}</label>
        <Field
          name='config.start'
          readOnly={readOnly}
          placeholder='HH:mm:ss'
          value={val('start', '')}
          onChange={handleChange}
          className={classNames({ 'is-invalid': ShowError('config.start', touched, errors) })}
          style={inputStyle}
        />
        <ErrorFor errors={errors} touched={touched} name='config.start' />
      </div>

      <div>
        <label>{i18n.t('end_time')}</label>
        <Field
          name='config.end'
          readOnly={readOnly}
          placeholder='HH:mm:ss'
          value={val('end', '')}
          onChange={handleChange}
          className={classNames({ 'is-invalid': ShowError('config.end', touched, errors) })}
          style={inputStyle}
        />
        <ErrorFor errors={errors} touched={touched} name='config.end' />
      </div>

      <div>
        <label>{i18n.t('lighting:lightning_frequency')}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Field
            name='config.frequency'
            type='number'
            readOnly={readOnly}
            value={val('frequency', 2)}
            onChange={handleChange}
            className={classNames({ 'is-invalid': ShowError('config.frequency', touched, errors) })}
            style={inputStyle}
          />
          <span style={{ marginLeft: 'var(--reefpi-space-xs)', whiteSpace: 'nowrap' }}>/min</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name='config.frequency' />
      </div>

      <div>
        <label>{i18n.t('lighting:lightning_flash_slot')}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Field
            name='config.flash_slot'
            type='number'
            readOnly={readOnly}
            value={val('flash_slot', 1)}
            onChange={handleChange}
            className={classNames({ 'is-invalid': ShowError('config.flash_slot', touched, errors) })}
            style={inputStyle}
          />
          <span style={{ marginLeft: 'var(--reefpi-space-xs)', whiteSpace: 'nowrap' }}>{i18n.t('sec')}</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name='config.flash_slot' />
      </div>

      <div>
        <label>{i18n.t('lighting:lightning_intensity')}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Field
            name='config.intensity'
            type='number'
            readOnly={readOnly}
            value={val('intensity', 100)}
            onChange={handleChange}
            className={classNames({ 'is-invalid': ShowError('config.intensity', touched, errors) })}
            style={inputStyle}
          />
          <span style={{ marginLeft: 'var(--reefpi-space-xs)' }}>%</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name='config.intensity' />
      </div>
    </div>
  )
}

export default LightningProfile
