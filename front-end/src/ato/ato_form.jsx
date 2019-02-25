import EditAto from './edit_ato'
import AtoSchema from './ato_schema'
import { withFormik } from 'formik'

const AtoForm = withFormik({
  displayName: 'AtoForm',
  mapPropsToValues: props => {
    let data = props.data
    if (data === undefined) {
      data = {
        enable: true,
        disable_on_alert: false,
        notify: {}
      }
    }
    return {
      id: data.id || '',
      name: data.name || '',
      enable: (data.enable === undefined ? true : data.enable),
      control: data.control || false,
      inlet: data.inlet || '',
      disable_on_alert: data.disable_on_alert || false,
      period: data.period || 120,
      pump: data.pump || '',
      notify: (data.notify && data.notify.enable) || false,
      maxAlert: (data.notify && data.notify.max) || 0
    }
  },
  validationSchema: AtoSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditAto)

export default AtoForm
