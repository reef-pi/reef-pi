import * as Yup from 'yup'
import i18n from 'utils/i18n'

const triggerSchema = {
  id: Yup.string()
    .required(i18n.t('validation:selection_required')),
  on: Yup.bool(),
  duration: Yup.number()
    .when('revert', {
      is: true,
      then: Yup.number().min(1, i18n.t('validation:integer_min_required')),
      otherwise: Yup.number().default(0)
    }),
  revert: Yup.bool()
}

const reminderSchema = {
  title: Yup.string()
    .required(i18n.t('validation:entry_required')),
  message: Yup.string()
    .required(i18n.t('validation:entry_required'))
}

const TimerSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  enable: Yup.bool()
    .required(i18n.t('validation:selection_required')),
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  month: Yup.string()
    .required(i18n.t('validation:cron_required')),
  week: Yup.string()
    .required(i18n.t('validation:cron_required')),
  day: Yup.string()
    .required(i18n.t('validation:cron_required')),
  hour: Yup.string()
    .required(i18n.t('validation:cron_required')),
  minute: Yup.string()
    .required(i18n.t('validation:cron_required')),
  second: Yup.string()
    .required(i18n.t('validation:cron_nojoker_required')),
  target: Yup.object().when('type', (type, schema) => {
    switch (type) {
      case 'ato':
      case 'equipment':
      case 'macro':
      case 'phprobes':
      case 'temperature':
      case 'doser':
      case 'lightings':
        return schema.shape(triggerSchema)
      case 'reminder':
        return schema.shape(reminderSchema)
      default:
        return schema.shape({
          type: Yup.string()
            .required(i18n.t('validation:selection_required'))
        })
    }
  })
})

export default TimerSchema
