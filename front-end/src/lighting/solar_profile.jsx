import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'

const SolarProfile = (props) => {
  return (
    <div className='form-inline'>
      <label className='mr-2'>{i18next.t('lighting:solar_latitude')}</label>
      <Field
        name={NameFor(props.name, 'latitude')}
        type='number'
        step='any'
        disabled={props.readOnly}
        className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2',
          { 'is-invalid': ShowError(NameFor(props.name, 'latitude'), props.touched, props.errors) })}
        placeholder='0.0'
      />
      <label className='mr-2'>{i18next.t('lighting:solar_longitude')}</label>
      <Field
        name={NameFor(props.name, 'longitude')}
        type='number'
        step='any'
        disabled={props.readOnly}
        className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2',
          { 'is-invalid': ShowError(NameFor(props.name, 'longitude'), props.touched, props.errors) })}
        placeholder='0.0'
      />
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
