import * as Yup from 'yup'
import i18n from 'utils/i18n'

const DriverSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  config: Yup.lazy(value => {
    const shape = {}
    Object.keys(value).forEach(prop => {
      shape[prop] = Yup.string().required(i18n.t('validation:entry_required'))
    })
    return Yup.object().shape(shape)
  })
})

export default DriverSchema
