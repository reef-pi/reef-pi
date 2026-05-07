import * as Yup from 'yup'
import i18next from 'i18next'

const EntrySchema = Yup.object().shape({
  value: Yup.number()
    .required(i18next.t('validation:entry_required')),
  comment: Yup.string(),
  timestamp: Yup.string()
    // Journal timestamps are persisted as display strings; parsing and sorting happen outside this schema.
    .required(i18next.t('validation:date_required'))
})

export default EntrySchema
