import * as Yup from 'yup'

const PhSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  jack: Yup.string()
    .required('Jack is required'),
  pin: Yup.string()
    .required('Pin is required'),
  enable: Yup.bool()
    .required('Doser Status is required'),
  duration: Yup.number()
    .required('Duration is required'),
  speed: Yup.number()
    .required('Speed is required'),
  day: Yup.string()
    .required('Day is required'),
  hour: Yup.string()
    .required('Hour is required'),
  minute: Yup.string()
    .required('Minute is required'),
  second: Yup.string()
    .required('Second is required')
})

export default PhSchema
