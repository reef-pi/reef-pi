import * as Yup from 'yup'
import i18next from 'i18next'

const JournalSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('journal:Name is required')),
  description: Yup.string()
    .required(i18next.t('journal:Description is required')),
  unit: Yup.string()
    .required(i18next.t('journal:Unit is required'))
})

export default JournalSchema
