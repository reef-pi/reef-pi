import * as Yup from 'yup'
import i18n from 'utils/i18n'

const TemperatureSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  sensor: Yup.string()
    .required(i18n.t('validation:selection_required')),
  fahrenheit: Yup.bool()
    .required(i18n.t('validation:selection_required')),
  period: Yup.number()
    .required(i18n.t('validation:number_required'))
    .integer(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required')),
  enable: Yup.bool(),
  alerts: Yup.bool(),
  one_shot: Yup.bool(),
  chart: Yup.object({
    ymin: Yup.number()
      .required(i18n.t('validation:number_required')),
    ymax: Yup.number()
      .required(i18n.t('validation:number_required')),
    color: Yup.string()
      .required(i18n.t('validation:selection_required'))
  }),
  minAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required(i18n.t('validation:number_required'))
          .typeError(i18n.t('validation:number_required'))
      } else { return schema }
    }),
  maxAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required(i18n.t('validation:number_required'))
          .typeError(i18n.t('validation:number_required'))
          .test('greaterThan', i18n.t('validation:a_must_be_greater_than_b', { a: i18n.t('temperature:alert_above'), b: i18n.t('temperature:alert_below') }), function (max) {
            return max > this.parent.minAlert
          })
      } else { return schema }
    }),
  control: Yup.string(),
  heater: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .test('match', i18n.t('validation:a_must_differ_from_b', { a: i18n.t('temperature:lower_function'), b: i18n.t('temperature:upper_function') }), function (heater) {
            if (heater === undefined || heater === '') { return true }
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
                .required(i18n.t('validation:number_required'))
                .typeError(i18n.t('validation:number_required'))
                .test('lessThan', i18n.t('validation:a_must_be_less_than_b', { a: i18n.t('temperature:lower_threshold'), b: i18n.t('temperature:upper_threshold') }), function (val) {
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
          .test('match', i18n.t('validation:a_must_differ_from_b', { a: i18n.t('temperature:lower_function'), b: i18n.t('temperature:upper_function') }), function (chiller) {
            if (chiller === undefined || chiller === '') { return true }
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
              .required(i18n.t('validation:number_required'))
              .typeError(i18n.t('validation:number_required'))
              .test('greaterThan', i18n.t('validation:a_must_be_greater_than_b', { a: i18n.t('temperature:upper_threshold'), b: i18n.t('temperature:lower_threshold') }), function (val) {
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
          .required(i18n.t('validation:number_required'))
          .typeError(i18n.t('validation:number_required'))
      } else { return schema }
    })
})

export default TemperatureSchema
