import * as Yup from 'yup'

const DriverSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  type: Yup.string()
    .required('Type is required'),
  config: Yup.object()
})

export default DriverSchema
