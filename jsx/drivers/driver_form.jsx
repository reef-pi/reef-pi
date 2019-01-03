import EditDriver from './edit_driver'
import DriverSchema from './driver_schema'
import {withFormik} from 'formik'

const DriverForm = withFormik({
  displayName: 'DriverFrom',
  mapPropsToValues: props => {
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
      config: data.config || {}
    })
  },
  validationSchema: DriverSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditDriver)

export default DriverForm
