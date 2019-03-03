import * as Yup from 'yup'

const InstanceSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  address: Yup.string().required('Address is requied'),
  user: Yup.string().required('Username is requied'),
  password: Yup.string().required('Password is requied'),
  ignore_https: Yup.bool()
})

export default InstanceSchema
