import * as Yup from 'yup'
import i18n from 'utils/i18n'

const JournalSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  description: Yup.string()
    .required(i18n.t('validation:entry_required')),
  unit: Yup.string()
    .required(i18n.t('validation:entry_required'))   //TODO: really required?
})

export default JournalSchema
