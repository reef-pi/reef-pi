import * as Yup from 'yup'
import i18n from 'utils/i18n'

const PhSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  enable: Yup.bool()
    .required(i18n.t('validation:selection_required')),
  period: Yup.number()
    .required(i18n.t('validation:number_required'))
    .integer(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required')),
  notify: Yup.bool(),
  one_shot: Yup.bool(),
  analog_input: Yup.string()
    .required(i18n.t('validation:selection_required')),
  minAlert: Yup.number()
    .when('notify', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required(i18n.t('validation:number_required'))
          .typeError(i18n.t('validation:number_required'))
          .test('lessThan', i18n.t('validation:a_must_be_less_than_b', { a: i18n.t('ph:alert_below'), b: i18n.t('ph:alert_above')}), function (min) {
            return min < this.parent.maxAlert
          })
      } else { return schema }
    }),
  maxAlert: Yup.number()
    .when('notify', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required(i18n.t('validation:number_required'))
          .typeError(i18n.t('validation:number_required'))
          .test('greaterThan', i18n.t('validation:a_must_be_greater_than_b', { a: i18n.t('ph:alert_above'), b: i18n.t('ph:alert_below')}), function (max) {
            return max > this.parent.minAlert
          })
      } else { return schema }
    }),
  control: Yup.string(),
  upperFunction: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .test('match', i18n.t('validation:a_must_differ_from_b', { a: i18n.t('ph:lower_function'), b: i18n.t('ph:upper_function') }), function (upperFunc) {
            if (upperFunc === undefined) { return true }
            return upperFunc !== this.parent.lowerFunction
          })
      } else { return schema }
    }),
  lowerThreshold: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .when('upperFunction', (upperFunc, schema) => {
            if (upperFunc === undefined || upperFunc === '') { return schema }
            return schema
              .required(i18n.t('validation:number_required'))
              .typeError(i18n.t('validation:number_required'))
              .test('lessThan', i18n.t('validation:a_must_be_less_than_b', { a: i18n.t('ph:lower_threshold'), b: i18n.t('ph:upper_threshold') }), function (min) {
                if (this.parent.lowerFunction === undefined || this.parent.lowerFunction === '') { return true }
                return min < this.parent.upperThreshold
              })
          })
      } else { return schema }
    }),
  lowerFunction: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .test('match', i18n.t('validation:a_must_differ_from_b', { a: i18n.t('ph:lower_function'), b: i18n.t('ph:upper_function') }), function (lowerFunc) {
            if (lowerFunc === undefined) { return true }
            return lowerFunc !== this.parent.upperFunction
          })
      } else { return schema }
    }),
  upperThreshold: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .when('lowerFunction', (lowerFunc, schema) => {
            if (lowerFunc === undefined || lowerFunc === '') { return schema }
            return schema
              .required(i18n.t('validation:number_required'))
              .typeError(i18n.t('validation:number_required'))
              .test('greaterThan', i18n.t('validation:a_must_be_greater_than_b', { a: i18n.t('ph:upper_threshold'), b: i18n.t('ph:lower_threshold') }), function (max) {
                if (this.parent.upperFunction === undefined || this.parent.upperFunction === '') { return true }
                return max > this.parent.lowerThreshold
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
          .min(0,i18n.t('validation:integer_min_required'))
          .test('lessThan', i18n.t('ph:hysteresis_less_than'), function (hysteresis) {
            if (this.parent.lowerFunction === undefined || this.parent.lowerFunction === '') { return true }
            if (this.parent.upperFunction === undefined || this.parent.upperFunction === '') { return true }
            return hysteresis < (this.parent.upperThreshold - this.parent.lowerThreshold)
          })
      } else { return schema }
    }),
  chart: Yup.object({
    ymin: Yup.number()
      .required(i18n.t('validation:number_required')),
    ymax: Yup.number()
      .required(i18n.t('validation:number_required')),
    color: Yup.string()
      .required(i18n.t('validation:selection_required')),
    unit: Yup.string()
  })
})

export default PhSchema
