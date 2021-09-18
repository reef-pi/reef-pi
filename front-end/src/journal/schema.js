import * as Yup from 'yup'
import i18n from 'utils/i18n'

const JournalSchema = Yup.object().shape({
  //TODO: add field date with default=Now ?  OR preset name with ANSI-date for proper sorting
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  description: Yup.string()
    .required(i18n.t('validation:entry_required')),
  unit: Yup.string()
    .required(i18n.t('validation:entry_required'))   //TODO: really required?
})

export default JournalSchema
