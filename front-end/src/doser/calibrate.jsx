import React from 'react'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import i18n from 'utils/i18n'
import { withFormik, Field } from 'formik'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export const Calibrate = ({
  values,
  errors,
  touched,
  submitForm,
  complete,
  readOnly
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    submitForm()
  }

  const dcPump = () => {
    return (
      <>
        <FormField label={i18n.t('doser:speed')} error={ShowError('speed', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='speed' /> : undefined}>
          <Field
            name='speed'
            type='number'
            disabled={readOnly}
            as={Input}
            invalid={ShowError('speed', touched, errors)}
          />
        </FormField>
        <FormField label={i18n.t('doser:duration')} error={ShowError('duration', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='duration' /> : undefined}>
          <Field
            name='duration'
            type='number'
            disabled={readOnly}
            as={Input}
            invalid={ShowError('duration', touched, errors)}
          />
        </FormField>
      </>
    )
  }

  const stepper = () => {
    return (
      <>
        <FormField label={i18n.t('doser:volume')} error={ShowError('volume', touched, errors) ? <ErrorFor errors={errors} touched={touched} name='duration' /> : undefined}>
          <Field
            name='volume'
            type='number'
            disabled={readOnly}
            as={Input}
            invalid={ShowError('volume', touched, errors)}
          />
        </FormField>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {values.pumpType === 'stepper' ? stepper() : dcPump()}
        <div>
          <Button
            type='submit'
            variant='primary'
            disabled={readOnly}
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18n.t('doser:calibration:run')}
          </Button>
        </div>
      </div>
    </form>
  )
}

const CalibrateSchema = Yup.object().shape({
  duration: Yup.number(),
  speed: Yup.number(),
  volume: Yup.number()
})

export const mapCalibratePropsToValues = props => {
  return {
    duration: props.duration,
    speed: props.speed,
    volume: props.volume,
    pumpType: props.pumpType
  }
}

export const submitCalibration = (values, props) => {
  props.onSubmit(parseFloat(values.duration), parseInt(values.speed), parseFloat(values.volume))
}

const CalibrateForm = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: mapCalibratePropsToValues,
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    submitCalibration(values, props)
  }
})(Calibrate)

export default CalibrateForm
