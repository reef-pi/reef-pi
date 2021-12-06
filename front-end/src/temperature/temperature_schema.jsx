import * as Yup from 'yup'
import i18next from 'i18next' // TODO: several i18next mappings!

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
  one_shot: Yup.bool(),
  chart: Yup.object({
    ymin: Yup.number().required('y axis minimum'),
    ymax: Yup.number().required('y axis maximum'),
    color: Yup.string().required('color')
  }),
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
  control: Yup.string(),
  heater: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .test('match', 'Heater and Chiller must be different', function (heater) {
            if (heater === undefined) { return true }
            return heater !== this.parent.cooler
          })
      } else { return schema }
    }),
  min: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .when('heater', (heater, schema) => {
            if (heater === undefined || heater === '') { return schema }
            return schema
              .required('Threshold is required when a heater is selected')
              .typeError('Threshold must be a number')
              .test('lessThan', 'Threshold must be less than Chiller Threshold', function (val) {
                if (this.parent.cooler === undefined || this.parent.cooler === '') { return true }
                return val < this.parent.max
              })
          })
      } else { return schema }
    }),
  cooler: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .test('match', 'Heater and Chiller must be different', function (chiller) {
            if (chiller === undefined) { return true }
            return chiller !== this.parent.heater
          })
      } else { return schema }
    }),
  max: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .when('cooler', (cooler, schema) => {
            if (cooler === undefined || cooler === '') { return schema }
            return schema
              .required('Threshold is required when a chiller is selected')
              .typeError('Threshold must be a number')
              .test('greaterThan', 'Threshold must be greater than Heater Threshold', function (val) {
                if (this.parent.heater === undefined || this.parent.heater === '') { return true }
                return val > this.parent.min
              })
          })
      } else { return schema }
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
