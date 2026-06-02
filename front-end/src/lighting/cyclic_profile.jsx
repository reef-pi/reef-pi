import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'

const inputStyle = { padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)', width: '100%' }

const CyclicProfile = (props) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--reefpi-space-sm)', alignItems: 'flex-end' }}>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('lighting:cyclic_period')}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Field
            name={NameFor(props.name, 'period')}
            type='number'
            min='1'
            readOnly={props.readOnly}
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'period'), props.touched, props.errors) })}
            style={{ ...inputStyle, width: '6rem' }}
          />
          <span style={{ marginLeft: 'var(--reefpi-space-xs)' }}>{i18next.t('second_s')}</span>
        </div>
      </div>
      <div>
        <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('lighting:cyclic_phase_shift')}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Field
            name={NameFor(props.name, 'phase_shift')}
            type='number'
            min='0'
            max='99'
            readOnly={props.readOnly}
            className={classNames({ 'is-invalid': ShowError(NameFor(props.name, 'phase_shift'), props.touched, props.errors) })}
            style={{ ...inputStyle, width: '6rem' }}
          />
          <span style={{ marginLeft: 'var(--reefpi-space-xs)' }}>%</span>
        </div>
      </div>
      <ErrorFor {...props} name={NameFor(props.name, 'period')} />
      <ErrorFor {...props} name={NameFor(props.name, 'phase_shift')} />
    </div>
  )
}

CyclicProfile.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired,
  touched: PropTypes.object,
  errors: PropTypes.object
}

export default CyclicProfile
