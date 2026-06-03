import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import { Field } from 'formik'
import i18next from 'i18next'
import { useDispatch } from 'react-redux'
import { fetchJournalUsage } from 'redux/actions/journal'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

const EditJournal = ({
  values,
  errors,
  touched,
  submitForm,
  isValid,
  dirty,
  readOnly
}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (values.id !== undefined) {
      dispatch(fetchJournalUsage(values.id))
    }
  }, [])

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
        <FormField label={i18next.t('name')} error={ShowError('name', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='name' /> : undefined}>
          <Field
            name='name'
            disabled={readOnly}
            as={Input}
            invalid={ShowError('name', touched, errors)}
          />
        </FormField>
        <FormField label={i18next.t('journal:description')} error={ShowError('description', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='description' /> : undefined}>
          <Field
            name='description'
            disabled={readOnly}
            as={Input}
            invalid={ShowError('description', touched, errors)}
          />
        </FormField>
        <FormField label={i18next.t('journal:unit')} error={ShowError('unit', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='unit' /> : undefined}>
          <Field
            name='unit'
            disabled={readOnly}
            as={Input}
            invalid={ShowError('unit', touched, errors)}
          />
        </FormField>
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-xxs)' }}>
          <Button
            type='submit'
            variant='primary'
            disabled={readOnly}
            data-testid='journal-save-btn'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18next.t('save')}
          </Button>
        </div>
      )}
    </form>
  )
}

EditJournal.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditJournal
