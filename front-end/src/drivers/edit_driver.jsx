import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError, showUpdateSuccessful } from 'utils/alert'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import i18n from 'utils/i18n'

const EditDriver = ({
  values,
  errors,
  touched,
  submitForm,
  handleChange,
  handleBlur,
  setValues,
  mode,
  isValid,
  dirty,
  readOnly,
  driverOptions
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(i18n.t('validation:error'))
    }
  }

  const driverTypeChangeHandler = (e) => {
    const type = e.target.value
    const config = {}
    driverOptions[type].forEach(item => {
      config[item.name.toLowerCase()] = item.default.toString()
    })
    if (setValues) {
      setValues({ ...values, type, config })
      return
    }
    handleChange(e)
  }

  const driverConfig = () => {
    const selectedType = driverOptions[values.type]
    if (selectedType == null) { return null }
    const params = []

    selectedType.slice().sort((a, b) => parseInt(a.order) - parseInt(b.order))
      .forEach((item) => {
        const fieldName = 'config.' + item.name.toLowerCase()
        const hasError = ShowError(fieldName, touched, errors)
        const param = (
          <div key={item.name} style={{ display: 'grid', gap: 'var(--reefpi-space-xxs)', minWidth: 0 }}>
            <label htmlFor={fieldName} style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.name}</label>
            <Input
              name={fieldName}
              disabled={readOnly}
              type={item.type === 4 ? 'checkbox' : 'text'}
              placeholder={item.default.toString()}
              invalid={!!hasError}
              value={values.config ? (values.config[item.name.toLowerCase()] || '') : ''}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <ErrorFor errors={errors} touched={touched} name={fieldName} />
          </div>
        )
        params.push(param)
      })

    if (readOnly) return null
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginBottom: 'var(--reefpi-space-sm)' }}>
        {params}
      </div>
    )
  }

  const typeOptions = () => {
    return Object.keys(driverOptions).map(item => {
      return (
        <option key={item} value={item}>
          {item}
        </option>
      )
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {!readOnly && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', marginBottom: 'var(--reefpi-space-sm)' }}>
          <FormField label={i18n.t('name')}>
            <Input
              name='name'
              data-testid='smoke-driver-name'
              disabled={readOnly}
              invalid={!!ShowError('name', touched, errors)}
              value={values.name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <ErrorFor errors={errors} touched={touched} name='name' />
          </FormField>
          <FormField label={i18n.t('configuration:drivers:type')}>
            <Select
              name='type'
              data-testid='smoke-driver-type'
              onChange={driverTypeChangeHandler}
              disabled={mode === 'edit' || readOnly}
              value={values.type}
            >
              <option value=''>
                -- {i18n.t('select')} --
              </option>
              {typeOptions()}
            </Select>
            <ErrorFor errors={errors} touched={touched} name='type' />
          </FormField>
        </div>
      )}
      {driverConfig()}
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-sm)' }}>
          <input
            type='submit'
            data-testid='smoke-driver-submit'
            value={i18n.t('save')}
            disabled={readOnly}
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem', cursor: 'pointer' }}
          />
        </div>
      )}
    </form>
  )
}

EditDriver.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func,
  setValues: PropTypes.func,
  driverOptions: PropTypes.object
}

export default EditDriver
