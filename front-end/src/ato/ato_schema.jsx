import * as Yup from 'yup'
import i18next from 'i18next'

const AtoSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('ato:name_required')),
  enable: Yup.bool()
    .required(i18next.t('ato:status_required')),
  inlet: Yup.string()
    .required(i18next.t('ato:inlet_required')),
  period: Yup.number()
    .required(i18next.t('ato:chk_freq_required'))
    .integer()
    .typeError(i18next.t('ato:chk_freq_number'))
    .min(1, i18next.t('ato:chk_freq_number_value')),
  pump: Yup.number(),
  notify: Yup.bool(),
  one_shot: Yup.bool(),
  is_macro: Yup.bool(),
  disable_on_alert: Yup.bool(),
  maxAlert: Yup.mixed()
    .when('notify', (notify, schema) => {
      if (notify === true) {
        return Yup
          .number()
          .required(i18next.t('ato:threshold_required'))
          .typeError(i18next.t('ato:threshold_value'))
          .min(1, i18next.t('ato:chk_freq_number_value'))
      } else { return schema }
    })

})

export default AtoSchema
