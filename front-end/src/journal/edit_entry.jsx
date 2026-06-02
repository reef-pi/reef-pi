import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import { Field } from 'formik'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

const EditEntry = ({
  values,
  errors,
  touched,
  submitForm,
  isValid,
  dirty
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18next.t('validation:error'))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={formGridStyle}>
        <FormField label={i18next.t('journal:value')} error={ShowError('value', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='value' /> : undefined}>
          <Field
            name='value'
            type='number'
            as={Input}
            invalid={ShowError('value', touched, errors)}
          />
        </FormField>
        <FormField label={i18next.t('journal:comment')} error={ShowError('comment', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='comment' /> : undefined}>
          <Field
            name='comment'
            as={Input}
            invalid={ShowError('description', touched, errors)}
          />
        </FormField>
        <FormField label={i18next.t('journal:timestamp')} error={ShowError('timestamp', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='timestamp' /> : undefined}>
          <Field
            name='timestamp'
            as={Input}
            invalid={ShowError('timestamp', touched, errors)}
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-xxs)' }}>
        <Button
          type='submit'
          variant='primary'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
        >
          {i18next.t('journal:add_entry')}
        </Button>
      </div>
    </form>
  )
}

EditEntry.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditEntry
