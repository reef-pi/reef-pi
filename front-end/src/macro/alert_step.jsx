import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import i18n from 'utils/i18n'

const AlertStep = ({ name, readOnly, touched, errors }) => {
  return (
    <div className='col-12 col-sm-4 col-md-3 form-group'>
      <div className='input-group'>
        <Field
          name={`${name}.title`}
          aria-label='Title'
          title={i18n.t('macro:alert:title')}
          type='string'
          readOnly={readOnly}
          placeholder={i18n.t('macro:alert:title')}
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.title`, touched, errors)
          })}
        />
        <ErrorFor errors={errors} touched={touched} name={`${name}.title`} />
      </div>
      <div className='input-group'>
        <Field
          name={`${name}.message`}
          title={i18n.t('macro:alert:message')}
          type='string'
          readOnly={readOnly}
          placeholder={i18n.t('macro:alert:message')}
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
