import * as Yup from 'yup'
import i18n from 'utils/i18n'

const SettingsSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  interface: Yup.string()
    .required(i18n.t('configuration:settings:network_interface_required')),
  address: Yup.string()
    .required(i18n.t('configuration:settings:network_address_required')),
  display: Yup.bool(),
  cors: Yup.bool(),
  notification: Yup.bool(),
  capabilities: Yup.object()
    .required(i18n.t('validation:selection_required')),
  health_check: Yup.object().shape({
    enable: Yup.bool(),
    max_memory: Yup.number()
      .integer(i18n.t('validation:number_required'))
      .min(1, i18n.t('validation:integer_min_required')),
    max_cpu: Yup.number()
      .integer(i18n.t('validation:number_required'))
      .min(1, i18n.t('validation:integer_min_required'))
  }),
  https: Yup.bool(),
  pprof: Yup.bool(),
  prometheus: Yup.bool(),
  rpi_pwm_freq: Yup.number()
    .integer(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required'))
})

export default SettingsSchema
