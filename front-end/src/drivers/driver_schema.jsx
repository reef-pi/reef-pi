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
      const v = value[prop]
      // Numeric fields (integer/decimal counts) must be >= 0; string fields must be non-empty
      if (v !== '' && !isNaN(v) && isFinite(v)) {
        shape[prop] = Yup.number()
          .typeError(i18n.t('validation:number_required'))
          .min(0, i18n.t('validation:integer_min_required'))
          .required(i18n.t('validation:number_required'))
      } else {
        shape[prop] = Yup.string().required(i18n.t('validation:entry_required'))
      }
    })
    return Yup.object().shape(shape)
  })
})

export default DriverSchema
