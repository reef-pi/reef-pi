import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import { Field } from 'formik'
import classNames from 'classnames'
import i18next from 'i18next'

const CyclicProfile = (props) => {
  return (
    <div className='d-flex align-items-center flex-wrap gap-2'>
      <label className='me-2'>{i18next.t('lighting:cyclic_period')}</label>
      <div className='input-group me-3'>
        <Field
          name={NameFor(props.name, 'period')}
          type='number'
          min='1'
          readOnly={props.readOnly}
          className={classNames('form-control col-12 col-sm-3 col-md-2 col-lg-2',
            { 'is-invalid': ShowError(NameFor(props.name, 'period'), props.touched, props.errors) })}
        />
        <div className='input-group-append'>
          <span className='input-group-text'>{i18next.t('second_s')}</span>
        </div>
      </div>
      <label className='me-2'>{i18next.t('lighting:cyclic_phase_shift')}</label>
      <div className='input-group me-3'>
        <Field
          name={NameFor(props.name, 'phase_shift')}
          type='number'
          min='0'
          max='99'
          readOnly={props.readOnly}
          className={classNames('form-control col-12 col-sm-3 col-md-2 col-lg-2',
            { 'is-invalid': ShowError(NameFor(props.name, 'phase_shift'), props.touched, props.errors) })}
        />
        <div className='input-group-append'>
          <span className='input-group-text'>%</span>
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
