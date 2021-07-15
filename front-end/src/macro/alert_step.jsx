import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import i18next from 'i18next'

const AlertStep = ({ name, readOnly, touched, errors }) => {
  return (
    <div className='col-12 col-sm-4 col-md-3 form-group'>
      <div className='input-group'>
        <Field
          name={`${name}.title`}
          aria-label='Title'
          title={i18next.t('macro:alert:title')}
          type='string'
          readOnly={readOnly}
          placeholder='Title'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.title`, touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name={`${name}.title`} />
      </div>
      <div className='input-group'>
        <Field
          name={`${name}.message`}
          aria-label='Message'
          title={i18next.t('macro:alert:message')}
          type='string'
          readOnly={readOnly}
          placeholder='Message'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.message`, touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name={`${name}.message`} />
      </div>
    </div>
  )
}

AlertStep.propTypes = {
  name: PropTypes.string,
  touched: PropTypes.object,
  errors: PropTypes.object,
  readOnly: PropTypes.bool
}

export default AlertStep
