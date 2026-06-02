import React from 'react'
import { Dialog } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import i18n from 'utils/i18n'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { withFormik, Field as FormikField } from 'formik'

export class CalibrationForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }

    this.handleCancel = this.handleCancel.bind(this)
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.props.readProbe(this.props.probe.id)
    }, 500)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  handleCancel () {
    this.props.cancel()
  }

  render () {
    return (
      <Dialog
        open
        onClose={this.handleCancel}
        title={`${i18n.t('temperature:calibrate')}: ${this.props.probe.name}`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)' }}>
            <Button
              role='abort'
              type='button'
              variant='secondary'
              onClick={this.handleCancel}
            >
              {i18n.t('cancel')}
            </Button>
            <Button
              role='confirm'
              type='submit'
              variant='primary'
              onClick={this.props.handleSubmit}
            >
              {i18n.t('apply')}
            </Button>
          </div>
        }
      >
        <form onSubmit={this.props.handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--reefpi-space-md)' }}>
            <FormField
              label={i18n.t('temperature:calibration:set_temperature')}
              error={ShowError('value', this.props.touched, this.props.errors) ? ErrorFor(this.props.errors, 'value') : undefined}
            >
              <FormikField name='value'>
                {({ field }) => (
                  <Input
                    {...field}
                    type='number'
                    invalid={ShowError('value', this.props.touched, this.props.errors)}
                  />
                )}
              </FormikField>
            </FormField>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--reefpi-space-xxs)' }}>
                {i18n.t('temperature:current_reading')}
              </div>
              <div>{this.props.currentReading[this.props.probe.id]}</div>
            </div>
          </div>
        </form>
      </Dialog>
    )
  }
}

const CalibrateSchema = Yup.object().shape({
  value: Yup.number()
    .required(i18n.t('validation:number_required'))
})

export const mapCalibrationPropsToValues = props => {
  return {
    value: props.defaultValue || props.currentReading[props.probe.id]
  }
}

export const submitCalibrationForm = (values, props) => {
  props.onSubmit(props.probe, parseFloat(values.value))
}

const CalibrationModal = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: mapCalibrationPropsToValues,
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    submitCalibrationForm(values, props)
  }
})(CalibrationForm)

export default CalibrationModal
