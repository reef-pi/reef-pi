import * as Yup from 'yup'
import i18next from 'i18next'

const JournalSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('journal:name_required')),
  description: Yup.string()
    .required(i18next.t('journal:description_required')),
  unit: Yup.string()
    .required(i18next.t('journal:unit_required'))
})

export default JournalSchema
