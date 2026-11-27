import React from 'react'
import * as Yup from 'yup'
import { ErrorMessage, ShowError } from '../utils/validation_helper'
import { withFormik, Field as FormikField } from 'formik'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

// What each calibration step says about itself (#3301).
const STATUS_TEXT = {
  locked: ['ph:step_locked', 'Store the previous point first.'],
  storing: ['ph:step_storing', 'Storing…'],
  stored: ['ph:step_stored', 'Stored'],
  failed: ['ph:step_failed', 'Not stored. Check the probe and try again.']
}

// One calibration point: the buffer's pH and the action that pairs it with the live reading.
export const Calibrate = ({ values, errors, touched, label, submitForm, readOnly, stepStatus = 'ready', point }) => {
  const handleSubmit = event => {
    event.preventDefault()
    submitForm()
  }
  // (Not `status`: Formik injects its own status prop.)
  const status = stepStatus
  const statusText = STATUS_TEXT[status]
  const statusId = point ? `ph-calibration-status-${point}` : undefined

  return (
    <form className='ph-calibration-step__form' onSubmit={handleSubmit}>
      <FormField
        label={label}
        error={ShowError('value', touched, errors) ? ErrorMessage(errors, 'value') : undefined}
        helpText={i18n.t('ph:buffer_help', { defaultValue: 'pH of the buffer solution' })}
      >
        <FormikField name='value'>
          {({ field }) => (
            <Input
              {...field}
              type='number'
              step='any'
              inputMode='decimal'
              disabled={readOnly}
              invalid={ShowError('value', touched, errors)}
              aria-describedby={statusText ? statusId : undefined}
            />
          )}
        </FormikField>
      </FormField>
      {status !== 'stored' && (
        <div className='ph-calibration-step__action'>
          <Button type='submit' disabled={readOnly} variant='secondary'>
            {i18n.t('ph:run_calibration')}
          </Button>
        </div>
      )}
      {statusText && (
        <span id={statusId} className={'ph-calibration-step__status ph-calibration-step__status--' + status} role={status === 'failed' ? 'alert' : undefined}>
          {i18n.t(statusText[0], { defaultValue: statusText[1] })}
        </span>
      )}
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
  return props.onSubmit(props.point, parseFloat(values.value))
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
