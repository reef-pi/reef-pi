import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import i18next from 'i18next'

const WaitStep = ({ name, readOnly, touched, errors }) => {
  return (
    <div className='col-12 col-sm-4 col-md-3 form-group'>
      <div className='input-group'>
        <Field
          name={`${name}.duration`}
          aria-label='Duration'
          title={i18next.t('macro:wait:duration')}
          type='number'
          readOnly={readOnly}
          placeholder='Duration'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.duration`, touched, errors)
          })}
        />
        <div className='input-group-append'>
          <span className='input-group-text d-none d-lg-flex'>
            {i18next.t('second_s')}
          </span>
          <span className='input-group-text d-flex d-lg-none'>sec</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name={`${name}.duration`} />
      </div>
    </div>
  )
}

WaitStep.propTypes = {
  name: PropTypes.string,
  touched: PropTypes.object,
  errors: PropTypes.object,
  readOnly: PropTypes.bool
}

export default WaitStep
