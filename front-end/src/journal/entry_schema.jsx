import * as Yup from 'yup'
import i18next from 'i18next'

const EntrySchema = Yup.object().shape({
  value: Yup.number()
    .required(i18next.t('journal:value_required')),
  comment: Yup.string(),
  timestamp: Yup.string()
    .required(i18next.t('journal:timestamp_required'))
})

export default EntrySchema
