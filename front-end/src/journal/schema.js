import * as Yup from 'yup'
import i18n from 'utils/i18n'

const entryRequiredMessage = i18n.t('validation:entry_required')
const unitRequiredMessage = entryRequiredMessage

const JournalSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  description: Yup.string()
    .required(entryRequiredMessage),
  unit: Yup.string()
    .required(unitRequiredMessage)
})

export default JournalSchema
