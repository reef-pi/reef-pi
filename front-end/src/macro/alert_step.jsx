import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18n from 'utils/i18n'
import { Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const AlertStep = ({ name, readOnly, touched, errors }) => {
  return (
    <div style={{ display: 'grid', gap: 'var(--reefpi-space-xs)', minWidth: '10rem' }}>
      <Field
        name={`${name}.title`}
        aria-label='Title'
        title={i18n.t('macro:alert:title')}
        type='string'
        readOnly={readOnly}
        placeholder={i18n.t('macro:alert:title')}
        as={Input}
        invalid={ShowError(`${name}.title`, touched, errors)}
      />
      <ErrorFor errors={errors} touched={touched} name={`${name}.title`} />
      <Field
        name={`${name}.message`}
        title={i18n.t('macro:alert:message')}
        type='string'
        readOnly={readOnly}
        placeholder={i18n.t('macro:alert:message')}
        as={Input}
        invalid={ShowError(`${name}.message`, touched, errors)}
      />
      <ErrorFor errors={errors} touched={touched} name={`${name}.message`} />
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
