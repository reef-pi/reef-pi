import * as Yup from 'yup'
import i18next from 'i18next'

const triggerSchema = {
  id: Yup.string().required(i18next.t('timers:equipment_required')),
  on: Yup.bool(),
  duration: Yup.number().when('revert', {
    is: true,
    then: Yup.number().min(1),
    otherwise: Yup.number().default(0)
  }),
  revert: Yup.bool()
}

const reminderSchema = {
  title: Yup.string().required(i18next.t('timers:reminder_title_required')),
  message: Yup.string().required(i18next.t('timers:reminder_message_required'))
}

const TimerSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('timers:name_required')),
  enable: Yup.bool()
    .required(i18next.t('timers:timer_status_required')),
  type: Yup.string()
    .required(i18next.t('timers:type_required')),
  day: Yup.string()
    .required(i18next.t('timers:day_required')),
  hour: Yup.string()
    .required(i18next.t('timers:hour_required')),
  minute: Yup.string()
    .required(i18next.t('timers:minute_required')),
  second: Yup.string()
    .required(i18next.t('timers:second_required')),
  month: Yup.string()
    .required(i18next.t('timers:month_required')),
  week: Yup.string()
    .required(i18next.t('timers:week_required')),
  target: Yup.object().when('type', (type, schema) => {
    switch (type) {
      case 'ato':
      case 'equipment':
      case 'macro':
      case 'ph':
      case 'temperature':
      case 'doser':
      case 'light':
        return schema.shape(triggerSchema)
      case 'reminder':
        return schema.shape(reminderSchema)
      default:
        return schema.shape({
          type: Yup.string().required('Timer type is required')
        })
    }
  })
})

export default TimerSchema
