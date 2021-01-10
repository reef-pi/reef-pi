import * as Yup from 'yup'
import i18next from 'i18next'

const PhSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('ph:name_required')),
  enable: Yup.bool()
    .required(i18next.t('ph:status_required')),
  period: Yup.number()
    .required(i18next.t('ph:period_required'))
    .integer()
    .typeError(i18next.t('ph:period_type'))
    .min(1, i18next.t('ph:period_min')),
  notify: Yup.bool(),
  one_shot: Yup.bool(),
  analog_input: Yup.string()
    .required(i18next.t('ph:analog_input_required')),
  minAlert: Yup.number()
    .when('notify', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required(i18next.t('ph:threshold_required'))
          .typeError(i18next.t('ph:threshold_type'))
          .test('lessThan', i18next.t('ph:threshold_less_than'), function (min) {
            return min < this.parent.maxAlert
          })
      } else { return schema }
    }),
  maxAlert: Yup.number()
    .when('notify', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required(i18next.t('ph:threshold_required'))
          .typeError(i18next.t('ph:threshold_type'))
          .test('greaterThan', i18next.t('ph:threshold_greater_than'), function (max) {
            return max > this.parent.minAlert
          })
      } else { return schema }
    }),
  control: Yup.string().required(i18next.t('ph:control_required')),
  lowerThreshold: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .required(i18next.t('ph:lower_threshold_required'))
          .typeError(i18next.t('ph:lower_threshold_type'))
          .test('lessThan', i18next.t('ph:lower_threshold_less_than'), function (min) {
            return min < this.parent.upperThreshold
          })
      } else { return schema }
    }),
  lowerFunction: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .required(i18next.t('ph:lower_function_required'))
      } else { return schema }
    }),
  upperThreshold: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .required(i18next.t('ph:upper_threshold_required'))
          .typeError(i18next.t('ph:upper_threshold_type'))
          .test('greaterThan', i18next.t('ph:upper_threshold_greater_than'), function (max) {
            return max > this.parent.lowerThreshold
          })
      } else { return schema }
    }),
  hysteresis: Yup.number()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .required(i18next.t('ph:hysteresis_required'))
          .typeError(i18next.t('ph:hysteresis_type'))
          .test('lessThan', i18next.t('ph:hysteresis_less_than'), function (hysteresis) {
            return hysteresis < (this.parent.upperThreshold - this.parent.lowerThreshold)
          })
      } else { return schema }
    }),
  upperFunction: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .required(i18next.t('ph:upper_function_required'))
      } else { return schema }
    }),
  chart: Yup.object({
    ymin: Yup.number().required(i18next.t('ph:y_axis_minimum_required')),
    ymax: Yup.number().required(i18next.t('ph:y_axis_maximum_required')),
    color: Yup.string().required(i18next.t('ph:chart_color_required')),
    unit: Yup.string()
  })
})

export default PhSchema
