import * as Yup from 'yup'
import i18n from 'utils/i18n'

const AtoSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  enable: Yup.bool()
    .required(i18n.t('validation:selection_required')),
  inlet: Yup.string()
    .required(i18n.t('validation:selection_required')),
  period: Yup.number()
    .required(i18n.t('validation:number_required'))
    .integer(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required')),

  control: Yup.string()
    .required(i18n.t('validation:selection_required')),
  pump: Yup.string()
    .when('control', (control, schema) => {
      if (control === 'macro' || control === 'equipment') {
        return schema
          .required(i18n.t('validation:selection_required'))
      } else { return schema }
    }),
  is_macro: Yup.bool(),

  notify: Yup.bool(),
  one_shot: Yup.bool(),
  disable_on_alert: Yup.bool(),
  maxAlert: Yup.mixed()
    .when('notify', (notify, schema) => {
      if (notify === true) {
        return Yup.number()
          .required(i18n.t('validation:number_required'))
          .integer(i18n.t('validation:number_required'))
          .min(1, i18n.t('validation:integer_min_required'))
      } else { return schema }
    })

})

export default AtoSchema
