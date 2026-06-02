import React from 'react'
import PropTypes from 'prop-types'
import { ErrorMessage, ErrorFor, ShowError } from '../utils/validation_helper'
import i18next from 'i18next'
import { showError, showUpdateSuccessful } from 'utils/alert'
import { Field } from 'formik'
import Cron from '../ui_components/cron'
import EditStepper from './edit_stepper'
import EditDcPump from './edit_dcpump'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: 'var(--reefpi-space-md)'
}

const EditDoser = ({
  values,
  errors,
  touched,
  doser,
  jacks,
  outlets,
  submitForm,
  isValid,
  onBlur,
  handleChange,
  setFieldValue,
  dirty,
  readOnly
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
      showUpdateSuccessful()
    } else {
      submitForm()
      showError(i18next.t('validation:error') + ErrorMessage(errors, ''))
    }
  }

  const driverUI = () => {
    if (values.type === 'stepper') {
      return (
        <EditStepper
          values={values}
          readOnly={readOnly}
          errors={errors}
          touched={touched}
          outlets={outlets}
          isValid={isValid}
          onBlur={onBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          dirty={dirty}
        />
      )
    } else {
      return (
        <EditDcPump
          values={values}
          readOnly={readOnly}
          errors={errors}
          touched={touched}
          jacks={jacks}
          isValid={isValid}
          onBlur={onBlur}
          handleChange={handleChange}
          setFieldValue={setFieldValue}
          dirty={dirty}
        />
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={formGridStyle}>
        <FormField label={i18next.t('name')} error={ShowError('name', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='name' /> : undefined}>
          <Input
            name='name'
            data-testid='smoke-doser-name'
            disabled={readOnly}
            onChange={handleChange}
            onBlur={onBlur}
            value={values.name}
            invalid={ShowError('name', touched, errors)}
          />
        </FormField>

        <FormField label={i18next.t('doser:volume')} error={ShowError('volume', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='volume' /> : undefined}>
          <Input
            name='volume'
            data-testid='smoke-doser-volume'
            readOnly={readOnly}
            type='number'
            onChange={handleChange}
            onBlur={onBlur}
            value={values.volume}
            invalid={ShowError('volume', touched, errors)}
          />
        </FormField>

        <FormField label={i18next.t('doser:type')} error={ShowError('type', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='type' /> : undefined}>
          <Select
            name='type'
            data-testid='smoke-doser-type'
            disabled={readOnly}
            onChange={handleChange}
            onBlur={onBlur}
            value={values.type}
            invalid={ShowError('type', touched, errors)}
          >
            <option value='dcpump' key='dcpump'> DC motor </option>
            <option value='stepper' key='stepper'> Stepper</option>
          </Select>
        </FormField>
      </div>

      {driverUI()}

      {!values.continuous && (
        <div style={{ marginTop: 'var(--reefpi-space-sm)' }}>
          <div>
            <label>{i18next.t('schedule')}</label>
          </div>
          <Cron
            values={values}
            touched={touched}
            errors={errors}
            readOnly={readOnly}
          />
        </div>
      )}

      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-xxs)' }}>
          <Button
            type='submit'
            variant='primary'
            data-testid='smoke-doser-submit'
            disabled={readOnly}
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18next.t('save')}
          </Button>
        </div>
      )}
    </form>
  )
}

EditDoser.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditDoser
