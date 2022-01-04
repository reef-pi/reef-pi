import * as Yup from 'yup'
import i18next from 'i18next'

const EntrySchema = Yup.object().shape({
  value: Yup.number()
    .required(i18next.t('validation:entry_required')),
  comment: Yup.string(),
  timestamp: Yup.string()
    // TODO: date strings don't sort well, differ by locale, and implicit cast may fail
    .required(i18next.t('validation:date_required'))
})

export default EntrySchema
