import React from 'react'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { withFormik, Field as FormikField } from 'formik'
import { FaCheck } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export const Calibrate = ({ values, errors, touched, label, submitForm, complete, readOnly }) => {
  const handleSubmit = event => {
    event.preventDefault()
    submitForm()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--reefpi-space-md)', alignItems: 'end' }}>
        <FormField
          label={label}
          error={ShowError('value', touched, errors) ? ErrorFor(errors, 'value') : undefined}
        >
          <FormikField name='value'>
            {({ field }) => (
              <Input
                {...field}
                type='number'
                step='any'
                disabled={readOnly}
                invalid={ShowError('value', touched, errors)}
              />
            )}
          </FormikField>
        </FormField>
        <div>
          {complete
            ? (
              <IconContext.Provider value={{ color: 'blue', className: 'align-bottom' }}>
                <FaCheck />
              </IconContext.Provider>
              )
            : (
              <Button
                type='submit'
                disabled={readOnly}
                variant='secondary'
                style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
              >
                {i18n.t('ph:run_calibration')}
              </Button>
              )}
        </div>
      </div>
    </form>
  )
}

const CalibrateSchema = Yup.object().shape({
  value: Yup.number()
    .required(i18n.t('validation:number_required'))
    .typeError(i18n.t('validation:number_required'))
})

export const mapCalibrationPropsToValues = props => {
  return {
    value: props.defaultValue
  }
}

export const submitCalibrationForm = (values, props) => {
  props.onSubmit(props.point, parseFloat(values.value))
}

const CalibrateForm = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: mapCalibrationPropsToValues,
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    submitCalibrationForm(values, props)
  }
})(Calibrate)

export default CalibrateForm
