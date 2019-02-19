import * as Yup from 'yup'
import i18next from 'i18next'

const TimerSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('timers:name_required')),
  enable: Yup.bool()
    .required(i18next.t('timers:timer_status_required')),
  day: Yup.string()
    .required(i18next.t('timers:day_required')),
  hour: Yup.string()
    .required(i18next.t('timers:hour_required')),
  minute: Yup.string()
    .required(i18next.t('timers:minute_required')),
  second: Yup.string()
    .required(i18next.t('timers:second_required')),
  type: Yup.string()
    .required(i18next.t('timers:type_required')),
  equipment_id: Yup.string()
    .when('type', (type, schema) => {
      if (type === 'equipment') {
        return schema.required(i18next.t('timers:equipment_required'))
      } else {
        return schema
      }
    }),
  on: Yup.bool().required(i18next.t('timers:on_required')),
  duration: Yup.number()
    .when(['type', 'revert'], (type, revert, schema) => {
      if (type === 'equipment' && revert === true) {
        return schema.required(i18next.t('timers:duration_required'))
      } else {
        return schema
      }
    }),
  revert: Yup.bool(),
  title: Yup.string()
    .when('type', (type, schema) => {
      if (type === 'reminder') {
        return schema.required(i18next.t('timers:subject_required'))
      } else {
        return schema
      }
    }),
  message: Yup.string()
    .when('type', (type, schema) => {
      if (type === 'reminder') {
        return schema.required(i18next.t('timers:message_required'))
      } else {
        return schema
      }
    })
})

export default TimerSchema
