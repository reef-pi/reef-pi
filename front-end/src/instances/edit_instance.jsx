import React from 'react'
import PropTypes from 'prop-types'
import { ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const EditInstance = ({
  values,
  errors,
  touched,
  actionLabel,
  handleBlur,
  submitForm,
  onDelete,
  handleChange,
  isValid,
  dirty
}) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18next.t('validation:error'))
    }
  }

  const deleteAction = () => {
    if (values.id) {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type='button'
            variant='danger'
            onClick={onDelete}
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18next.t('delete')}
          </Button>
        </div>
      )
    }
    return ''
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
        {deleteAction()}
        <FormField label={i18next.t('name')} error={ShowError('name', touched, errors) ? errors.name : undefined}>
          <Input
            type='text'
            name='name'
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('name', touched, errors)}
            value={values.name}
          />
        </FormField>
        <FormField label={i18next.t('address')} error={ShowError('address', touched, errors) ? errors.address : undefined}>
          <Input
            type='text'
            name='address'
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('address', touched, errors)}
            value={values.address}
          />
        </FormField>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
        <FormField label={i18next.t('user')} error={ShowError('user', touched, errors) ? errors.user : undefined}>
          <Input
            type='text'
            name='user'
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('user', touched, errors)}
            value={values.user}
          />
        </FormField>
        <FormField label={i18next.t('password')} error={ShowError('password', touched, errors) ? errors.password : undefined}>
          <Input
            type='password'
            name='password'
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={ShowError('password', touched, errors)}
            value={values.password}
          />
        </FormField>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-sm)' }}>
        <Button
          type='submit'
          variant='primary'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
        >
          {actionLabel}
        </Button>
      </div>
    </form>
  )
}

EditInstance.propTypes = {
  actionLabel: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditInstance
