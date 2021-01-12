import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import Datepicker from 'ui_components/datepicker'
import i18next from 'i18next'

const LunarProfile = (props) => {
  return (
    <div className='form-inline'>
      <label className='mr-2'>{i18next.t('full_moon')}</label>
      <div className='col-12 col-sm-3 col-md-2 col-lg-2 mr-3' style={{ padding: 0 }}>
        <Datepicker
          name={NameFor(props.name, 'full_moon')}
          readOnly={props.readOnly}
          placeholderText='YYYY-MM-DD'
          maxDate={new Date()}
          className={classNames('form-control',
            { 'is-invalid': ShowError(NameFor(props.name, 'full_moon'), props.touched, props.errors) })}
        />
      </div>
      <label className='mr-2'>{i18next.t('start_time')}</label>
      <Field
        name={NameFor(props.name, 'start')}
        readOnly={props.readOnly}
        className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2',
          { 'is-invalid': ShowError(NameFor(props.name, 'start'), props.touched, props.errors) })}
        placeholder='HH:mm:ss'
      />
      <label className='mr-2'>{i18next.t('end_time')}</label>
      <Field
        name={NameFor(props.name, 'end')}
        readOnly={props.readOnly}
        className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2',
          { 'is-invalid': ShowError(NameFor(props.name, 'end'), props.touched, props.errors) })}
        placeholder='HH:mm:ss'
      />
      <ErrorFor {...props} name={NameFor(props.name, 'full_moon')} />
      <ErrorFor {...props} name={NameFor(props.name, 'start')} />
      <ErrorFor {...props} name={NameFor(props.name, 'end')} />
    </div>
  )
}

LunarProfile.defaultProps = {
  start: '',
  end: '',
  full_moon: ''
}

LunarProfile.propTypes = {
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  touched: PropTypes.array,
  errors: PropTypes.array
}

export default LunarProfile
