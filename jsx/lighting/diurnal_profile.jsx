import React from 'react'
import PropTypes from 'prop-types'
import {ErrorFor, NameFor, ShowError} from 'utils/validation_helper'
import {Field} from 'formik'
import classNames from 'classnames'

const DiurnalProfile = (props) => {
  return (
    <div className='form-inline'>

      <label className='mr-2'>Start Time</label>
      <Field name={NameFor(props.name, 'start')}
        readOnly={props.readOnly}
        className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2',
          {'is-invalid': ShowError(NameFor(props.name, 'start'), props.touched, props.errors)})}
        placeholder='HH:mm'
      />
      <label className='mr-2'>End Time</label>
      <Field name={NameFor(props.name, 'end')}
        readOnly={props.readOnly}
        className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2',
          {'is-invalid': ShowError(NameFor(props.name, 'end'), props.touched, props.errors)})}
        placeholder='HH:mm'
      />
      <ErrorFor {...props} name={NameFor(props.name, 'start')} />
      <ErrorFor {...props} name={NameFor(props.name, 'end')} />
    </div>
  )
}

DiurnalProfile.defaultProps = {
  start: '',
  end: ''
}

DiurnalProfile.propTypes = {
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired
}

export default DiurnalProfile
