import EditAto from './edit_ato'
import AtoSchema from './ato_schema'
import { withFormik } from 'formik'

const AtoForm = withFormik({
  displayName: 'AtoForm',
  mapPropsToValues: props => ({
    id: (props.data && props.data.id) || '',
    name: (props.data && props.data.name) || '',
    enable: (props.data && props.data.enable) || true,
    control: (props.data && props.data.control) || false,
    inlet: (props.data && props.data.inlet) || '',
    period: (props.data && props.data.period) || 120,
    pump: (props.data && props.data.pump) || '',
    notify: (props.data && props.data.notify && props.data.notify.enable) || false,
    maxAlert: (props.data && props.data.notify && props.data.notify.max) || 0
  }),
  validationSchema: AtoSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditAto)

export default AtoForm
