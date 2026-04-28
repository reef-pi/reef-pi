import EditDriver from './edit_driver'
import DriverSchema from './driver_schema'
import { withFormik } from 'formik'

export const mapDriverPropsToValues = props => {
  let data = props.data
  if (data === undefined) {
    data = {
      name: '',
      config: {},
      type: ''
    }
  }
  return ({
    id: data.id || '',
    name: data.name || '',
    type: data.type || '',
    config: data.config || {}
  })
}

export const submitDriverForm = (values, formikBag) => {
  formikBag.props.onSubmit(values, formikBag)
}

const DriverForm = withFormik({
  displayName: 'DriverFrom',
  mapPropsToValues: mapDriverPropsToValues,
  validationSchema: DriverSchema,
  handleSubmit: (values, formikBag) => {
    submitDriverForm(values, formikBag)
  }
})(EditDriver)

export default DriverForm
