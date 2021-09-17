import * as Yup from 'yup'
import i18n from 'utils/i18n'

const DoserSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  jack: Yup.string()
    .required(i18n.t('validation:selection_required')),
  pin: Yup.string()
    .required(i18n.t('validation:selection_required')),
  enable: Yup.bool()
    .required(i18n.t('validation:selection_required')),
  duration: Yup.number()
    .required(i18n.t('validation:number_required'))
    .typeError(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required')),
  speed: Yup.number()
    .required(i18n.t('validation:number_required'))
    .typeError(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required'))
    .max(100, i18n.t('validation:integer_max_required')),
  month: Yup.string()
    .required(i18n.t('validation:cron_required'))
    .matches(/^(\*|(\d+(\-\d+)?))$/, i18n.t('validation:cron_required')),
  week: Yup.string()
    .required(i18n.t('validation:cron_required'))
    .matches(/^(\*|(\d+(\-\d+)?))$/, i18n.t('validation:cron_required')),
  day: Yup.string()
    .required(i18n.t('validation:cron_required'))
    .matches(/^(\*|(\d+(\-\d+)?))$/, i18n.t('validation:cron_required')),
  hour: Yup.string()
    .required(i18n.t('validation:cron_required'))
    .matches(/^(\*|(\d+(\-\d+)?))$/, i18n.t('validation:cron_required')),
  minute: Yup.string()
    .required(i18n.t('validation:cron_required'))
    .matches(/^(\*|(\d+(\-\d+)?))$/, i18n.t('validation:cron_required')),
  second: Yup.string()
    .required(i18n.t('validation:cron_nojoker_required'))
    .matches(/^(\d+(\-\d+)?)$/, i18n.t('validation:cron_nojoker_required'))
})

export default DoserSchema
