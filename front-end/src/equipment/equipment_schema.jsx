import * as Yup from 'yup'
import i18n from 'utils/i18n'

const EquipmentSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  outlet: Yup.string()
    .required(i18n.t('validation:selection_required')),
  stay_off_on_boot: Yup.bool().default(false)
})

export default EquipmentSchema
