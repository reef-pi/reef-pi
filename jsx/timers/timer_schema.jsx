import * as Yup from 'yup'

const TimerSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  enable: Yup.bool()
    .required('Timer Status is required'),
  day: Yup.string()
    .required('Day is required'),
  hour: Yup.string()
    .required('Hour is required'),
  minute: Yup.string()
    .required('Minute is required'),
  second: Yup.string()
    .required('Second is required'),
  type: Yup.string()
    .required('Type is required'),
  equipment_id: Yup.string()
    .when('type', (type, schema) => {
      if (type === 'equipment') {
        return schema.required('Equipment is required')
      } else {
        return schema
      }
    }),
  on: Yup.bool().required('On is required'),
  duration: Yup.number()
    .when(['type', 'revert'], (type, revert, schema) => {
      if (type === 'equipment' && revert === true) {
        return schema.required('Duration is required')
      } else {
        return schema
      }
    }),
  revert: Yup.bool(),
  title: Yup.string()
    .when('type', (type, schema) => {
      if (type === 'reminder') {
        return schema.required('Subject is required')
      } else {
        return schema
      }
    }),
  message: Yup.string()
    .when('type', (type, schema) => {
      if (type === 'reminder') {
        return schema.required('Message is required')
      } else {
        return schema
      }
    })
})

export default TimerSchema
