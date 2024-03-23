import * as Yup from 'yup'
import i18n from 'utils/i18n'

const Stepperchema = Yup.object().shape({
  direction_pin: Yup.string(),
  step_pin: Yup.string(),
  ms_pin_a: Yup.string(),
  ms_pin_b: Yup.string(),
  ms_pin_c: Yup.string(),
  spr: Yup.number(),
  delay: Yup.number(),
  vpr: Yup.number(),
  direction: Yup.bool(),
  microstepping: Yup.string()
})

const Restdoserchema = Yup.object().shape({
  url: Yup.string()
})

const DoserSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  type: Yup.string(),
  jack: Yup.string(),
  pin: Yup.string(),
  stepper: Stepperchema,
  restdoser: Restdoserchema,
  enable: Yup.bool()
    .required(i18n.t('validation:selection_required')),
  duration: Yup.number()
    .typeError(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required')),
  speed: Yup.number()
    .typeError(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required'))
    .max(100, i18n.t('validation:integer_max_required')),
  month: Yup.string()
    .required(i18n.t('validation:cron_required')),
  week: Yup.string()
    .required(i18n.t('validation:cron_required')),
  day: Yup.string()
    .required(i18n.t('validation:cron_required')),
  hour: Yup.string()
  // 6,12,19
    .required(i18n.t('validation:cron_required')),
  minute: Yup.string()
    .required(i18n.t('validation:cron_required')),
  second: Yup.string()
    .required(i18n.t('validation:cron_nojoker_required'))
})

export default DoserSchema
