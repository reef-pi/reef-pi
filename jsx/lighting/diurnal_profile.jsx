import React from 'react'
import PropTypes from 'prop-types'
import {ErrorFor, NameFor, ShowError} from 'utils/validation_helper'
import {Field} from 'formik'

const DiurnalProfile = (props) => {

  return (
    <div className="form-inline">
      
      <label className='mr-2'>Start Time</label>
      <Field name={NameFor(props, 'start')}
        readOnly={props.readOnly}
        className={ShowError(props, NameFor(props, 'start')) ? 'form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2 is-invalid' : 'form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2'}
        placeholder="HH:mm"
      />      
      <label className='mr-2'>End Time</label>
      <Field name={NameFor(props, 'end')}
        readOnly={props.readOnly}
        className={ShowError(props, NameFor(props, 'end')) ? 'form-control col-12 col-sm-3 col-md-2 col-lg-2 is-invalid' : 'form-control col-12 col-sm-3 col-md-2 col-lg-2'}
        placeholder="HH:mm"
      />
      <ErrorFor {...props} name={NameFor(props, 'start')} />
      <ErrorFor {...props} name={NameFor(props, 'end')} />
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