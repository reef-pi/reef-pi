import * as Yup from 'yup'
import i18next from 'i18next'

const InstanceSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('validation:name_required')),
  address: Yup.string()
    .required(i18next.t('validation:entry_required')),
  user: Yup.string()
    .required(i18next.t('validation:entry_required')),
  password: Yup.string()
    .required(i18next.t('validation:entry_required')),
  ignore_https: Yup.bool()
})

export default InstanceSchema
