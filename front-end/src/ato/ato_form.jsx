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
    const values = {
      id: data.id || '',
      name: data.name || '',
      enable: (data.enable === undefined ? true : data.enable),
      control: '',
      inlet: data.inlet || '',
      one_shot: data.one_shot || false,
      disable_on_alert: data.disable_on_alert || false,
      period: data.period || 60,
      pump: data.pump || '',
      notify: (data.notify && data.notify.enable) || false,
      maxAlert: (data.notify && data.notify.max) || 120
    }
    if (data.control === true) {
      if (data.is_macro === true) { values.control = 'macro' } else { values.control = 'equipment' }
    }
    return values
  },
  validationSchema: AtoSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditAto)

export default AtoForm
