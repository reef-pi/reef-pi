import React from 'react'
import i18next from 'i18next'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'

const RandomProfile = (props) => {
  return (
    <div className='form-inline'>

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
      <ErrorFor {...props} name={NameFor(props.name, 'start')} />
      <ErrorFor {...props} name={NameFor(props.name, 'end')} />
    </div>
  )
}

RandomProfile.defaultProps = {
  start: '',
  end: ''
}

RandomProfile.propTypes = {
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired
}

export default RandomProfile
