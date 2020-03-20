import * as Yup from 'yup'
import i18next from 'i18next'

const TemperatureSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  sensor: Yup.string()
    .required('Sensor is required'),
  fahrenheit: Yup.bool()
    .required('Unit is required'),
  period: Yup.number()
    .required('Check Frequency is required')
    .integer()
    .typeError('Check Frequency must be a number')
    .min(1, 'Check Frequency must be 1 second or greater'),
  enable: Yup.bool()
    .required('Sensor Status is required'),
  alerts: Yup.bool()
    .required('Alerts is required'),
  minAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required('Threshold is required when alerts are enabled')
          .typeError('Threshold must be a number')
      } else { return schema }
    }),
  maxAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required('Threshold is required when alerts are enabled')
          .typeError('Threshold must be a number')
          .test('greaterThan', 'Alert Above must be greater than Alert Below', function (max) {
            return max > this.parent.minAlert
          })
      } else { return schema }
    }),
  heater: Yup.string()
    .test('match', 'Heater and Chiller must be different', function (heater) {
      if (heater === undefined || heater === '') { return true }
      return heater !== this.parent.cooler
    }),
  min: Yup.number()
    .when('heater', (heater, schema) => {
      if (heater === undefined || heater === '') { return schema }
      return schema
        .required('Threshold is required when a heater is selected')
        .typeError('Threshold must be a number')
        .test('lessThan', 'Threshold must be less than Chiller Threshold', function (val) {
          if (this.parent.cooler === undefined || this.parent.cooler === '') { return true }
          return val < this.parent.max
        })
    }),
  cooler: Yup.string()
    .test('match', 'Heater and Chiller must be different', function (chiller) {
      if (chiller === undefined || chiller === '') { return true }
      return chiller !== this.parent.heater
    }),
  max: Yup.number()
    .when('cooler', (cooler, schema) => {
      if (cooler === undefined || cooler === '') { return schema }
      return schema
        .required('Threshold is required when a chiller is selected')
        .typeError('Threshold must be a number')
        .test('greaterThan', 'Threshold must be greater than Heater Threshold', function (val) {
          if (this.parent.heater === undefined || this.parent.heater === '') { return true }
          return val > this.parent.min
        })
    }),
  hysteresis: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .required(i18next.t('temperature:hysteresis_required'))
          .typeError(i18next.t('temperature:hysteresis_type'))
      } else { return schema }
    })
})

export default TemperatureSchema
