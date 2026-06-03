import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18n from 'utils/i18n'
import { Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const WaitStep = ({ name, readOnly, touched, errors }) => {
  return (
    <div style={{ minWidth: '10rem' }}>
      <div style={{ display: 'inline-flex', gap: 'var(--reefpi-space-xs)', alignItems: 'center' }}>
        <Field
          name={`${name}.duration`}
          aria-label='Duration'
          title={i18n.t('macro:wait:duration')}
          type='number'
          readOnly={readOnly}
          placeholder={i18n.t('macro:wait:duration')}
          as={Input}
          invalid={ShowError(`${name}.duration`, touched, errors)}
        />
        <span>{i18n.t('second_s')}</span>
      </div>
      <ErrorFor errors={errors} touched={touched} name={`${name}.duration`} />
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
