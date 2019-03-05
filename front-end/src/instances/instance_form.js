import EditInstance from './edit_instance'
import InstanceSchema from './instance_schema'
import { withFormik } from 'formik'

const EditInstanceForm = withFormik({
  displayName: 'InstanceForm',
  mapPropsToValues: props => ({
    name: (props.instance && props.instance.name) || '',
    id: (props.instance && props.instance.id) || '',
    address: (props.instance && props.instance.address) || '',
    user: (props.instance && props.instance.user) || '',
    password: (props.instance && props.instance.password) || '',
    ignore_https: (props.instance && props.instance.ignore_https) || false,
    remove: props.remove
  }),
  validationSchema: InstanceSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditInstance)

export default EditInstanceForm
