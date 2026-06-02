import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { Field as FormikField } from 'formik'
import { Field as FormField } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import i18next from 'i18next'

const Cron = ({ values, errors, touched, readOnly }) => {
  const fields = [
    { name: 'month', label: i18next.t('cron:month'), testId: 'smoke-cron-month' },
    { name: 'week', label: i18next.t('cron:week'), testId: 'smoke-cron-week' },
    { name: 'day', label: i18next.t('cron:day_of_month'), testId: 'smoke-cron-day' },
    { name: 'hour', label: i18next.t('cron:hour'), testId: 'smoke-cron-hour' },
    { name: 'minute', label: i18next.t('cron:minute'), testId: 'smoke-cron-minute' },
    { name: 'second', label: i18next.t('cron:second'), testId: 'smoke-cron-second' }
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: 'var(--reefpi-space-sm)' }}>
      {fields.map(field => (
        <FormField key={field.name} label={field.label}>
          <FormikField
            name={field.name}
            data-testid={field.testId}
            disabled={readOnly}
            className={ShowError(field.name, touched, errors) ? 'is-invalid' : ''}
          />
          <ErrorFor errors={errors} touched={touched} name={field.name} />
        </FormField>
      ))}
    </div>
  )
}

export default Cron

Cron.propTypes = {
  readOnly: PropTypes.bool,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired
}
