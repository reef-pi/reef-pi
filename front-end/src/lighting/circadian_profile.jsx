import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'

const inputStyle = { padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)', width: '100%' }

const CircadianProfile = (props) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--reefpi-space-sm)', alignItems: 'flex-end' }}>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('start_time')}</label>
        <Field
          name={NameFor(props.name, 'start')}
          readOnly={props.readOnly}
          className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'start'), props.touched, props.errors) })}
          style={inputStyle}
          placeholder='HH:mm:ss'
        />
      </div>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('end_time')}</label>
        <Field
          name={NameFor(props.name, 'end')}
          readOnly={props.readOnly}
          className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'end'), props.touched, props.errors) })}
          style={inputStyle}
          placeholder='HH:mm:ss'
        />
      </div>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('lighting:circadian_dawn_value')}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Field
            name={NameFor(props.name, 'dawn_value')}
            type='number'
            min='0'
            max='100'
            readOnly={props.readOnly}
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'dawn_value'), props.touched, props.errors) })}
            style={{ ...inputStyle, width: '5rem' }}
          />
          <span style={{ marginLeft: 'var(--reefpi-space-xs)' }}>%</span>
        </div>
      </div>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('lighting:circadian_noon_value')}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Field
            name={NameFor(props.name, 'noon_value')}
            type='number'
            min='0'
            max='100'
            readOnly={props.readOnly}
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'noon_value'), props.touched, props.errors) })}
            style={{ ...inputStyle, width: '5rem' }}
          />
          <span style={{ marginLeft: 'var(--reefpi-space-xs)' }}>%</span>
        </div>
      </div>
      <ErrorFor {...props} name={NameFor(props.name, 'start')} />
      <ErrorFor {...props} name={NameFor(props.name, 'end')} />
      <ErrorFor {...props} name={NameFor(props.name, 'dawn_value')} />
      <ErrorFor {...props} name={NameFor(props.name, 'noon_value')} />
    </div>
  )
}

CircadianProfile.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired,
  touched: PropTypes.object,
  errors: PropTypes.object
}

export default CircadianProfile
