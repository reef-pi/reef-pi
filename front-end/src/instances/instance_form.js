import EditInstance from './edit_instance'
import InstanceSchema from './instance_schema'
import { withFormik } from 'formik'

export const mapInstancePropsToValues = props => ({
  name: (props.instance && props.instance.name) || '',
  id: (props.instance && props.instance.id) || '',
  address: (props.instance && props.instance.address) || '',
  user: (props.instance && props.instance.user) || '',
  password: (props.instance && props.instance.password) || '',
  ignore_https: (props.instance && props.instance.ignore_https) || false,
  remove: props.remove
})

export const submitInstanceForm = (values, props) => {
  props.onSubmit(values)
}

const EditInstanceForm = withFormik({
  displayName: 'InstanceForm',
  mapPropsToValues: mapInstancePropsToValues,
  validationSchema: InstanceSchema,
  handleSubmit: (values, { props }) => {
    submitInstanceForm(values, props)
  }
})(EditInstance)

export default EditInstanceForm
