import EditPh from './edit_ph'
import PhSchema from './ph_schema'
import { withFormik } from 'formik'

const PhForm = withFormik({
  displayName: 'PhForm',
  mapPropsToValues: props => {
    let data = props.probe
    if (data === undefined) {
      data = {
        notify: {}
      }
    }
    return {
      id: data.id || '',
      name: data.name || '',
      analog_input: data.analog_input || '',
      enable: (data.enable === undefined ? true : data.enable),
      analogInputs: props.analogInputs || [],
      period: data.period || 60,
      notify: data.notify.enable || false,
      maxAlert: (data.notify && data.notify.max) || 0,
      minAlert: (data.notify && data.notify.min) || 0
    }
  },
  validationSchema: PhSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditPh)

export default PhForm
