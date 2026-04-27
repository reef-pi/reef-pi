import * as Yup from 'yup'
import i18n from 'utils/i18n'

const FlowMeterSchema = Yup.object().shape({
  name: Yup.string().required(i18n.t('validation:name_required')),
  enable: Yup.bool().required(i18n.t('validation:selection_required')),
  sensor: Yup.string().required(i18n.t('validation:entry_required')),
  pulses_per_liter: Yup.number()
    .typeError(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required'))
    .required(i18n.t('validation:entry_required')),
  period: Yup.number()
    .typeError(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required')),
  notify_enable: Yup.bool(),
  notify_min: Yup.number()
    .typeError(i18n.t('validation:number_required'))
    .min(0, i18n.t('validation:integer_min_required'))
})

export default FlowMeterSchema
