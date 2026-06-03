import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'

const inputStyle = { padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)', width: '100%' }

const SolarProfile = (props) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--reefpi-space-sm)', alignItems: 'flex-end' }}>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('lighting:solar_latitude')}</label>
        <Field
          name={NameFor(props.name, 'latitude')}
          type='number'
          step='any'
          disabled={props.readOnly}
          className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'latitude'), props.touched, props.errors) })}
          style={inputStyle}
          placeholder='0.0'
        />
      </div>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('lighting:solar_longitude')}</label>
        <Field
          name={NameFor(props.name, 'longitude')}
          type='number'
          step='any'
          disabled={props.readOnly}
          className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'longitude'), props.touched, props.errors) })}
          style={inputStyle}
          placeholder='0.0'
        />
      </div>
      <ErrorFor {...props} name={NameFor(props.name, 'latitude')} />
      <ErrorFor {...props} name={NameFor(props.name, 'longitude')} />
    </div>
  )
}

SolarProfile.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired,
  touched: PropTypes.object,
  errors: PropTypes.object
}

export default SolarProfile
