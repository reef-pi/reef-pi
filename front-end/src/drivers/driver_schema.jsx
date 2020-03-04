import * as Yup from 'yup'

const DriverSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  type: Yup.string()
    .required('Type is required'),
  config: Yup.lazy(value => {
    const shape = {}
    Object.keys(value).map(prop => {
      shape[prop] = Yup.string().required(prop + ' is required')
    })
    return Yup.object().shape(shape)
  })
})

export default DriverSchema
