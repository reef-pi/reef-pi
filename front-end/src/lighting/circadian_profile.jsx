import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'

const CircadianProfile = (props) => {
  return (
    <div className='d-flex align-items-center flex-wrap gap-2'>
      <label className='me-2'>{i18next.t('start_time')}</label>
      <Field
        name={NameFor(props.name, 'start')}
        readOnly={props.readOnly}
        className={classNames('form-control me-3 col-12 col-sm-3 col-md-2 col-lg-2',
          { 'is-invalid': ShowError(NameFor(props.name, 'start'), props.touched, props.errors) })}
        placeholder='HH:mm:ss'
      />
      <label className='me-2'>{i18next.t('end_time')}</label>
      <Field
        name={NameFor(props.name, 'end')}
        readOnly={props.readOnly}
        className={classNames('form-control me-3 col-12 col-sm-3 col-md-2 col-lg-2',
          { 'is-invalid': ShowError(NameFor(props.name, 'end'), props.touched, props.errors) })}
        placeholder='HH:mm:ss'
      />
      <label className='me-2'>{i18next.t('lighting:circadian_dawn_value')}</label>
      <div className='input-group me-3'>
        <Field
          name={NameFor(props.name, 'dawn_value')}
          type='number'
          min='0'
          max='100'
          readOnly={props.readOnly}
          className={classNames('form-control col-12 col-sm-2 col-md-1',
            { 'is-invalid': ShowError(NameFor(props.name, 'dawn_value'), props.touched, props.errors) })}
        />
        <div className='input-group-append'>
          <span className='input-group-text'>%</span>
        </div>
      </div>
      <label className='me-2'>{i18next.t('lighting:circadian_noon_value')}</label>
      <div className='input-group me-3'>
        <Field
          name={NameFor(props.name, 'noon_value')}
          type='number'
          min='0'
          max='100'
          readOnly={props.readOnly}
          className={classNames('form-control col-12 col-sm-2 col-md-1',
            { 'is-invalid': ShowError(NameFor(props.name, 'noon_value'), props.touched, props.errors) })}
        />
        <div className='input-group-append'>
          <span className='input-group-text'>%</span>
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
