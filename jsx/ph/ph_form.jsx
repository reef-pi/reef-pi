import EditPh from './edit_ph'
import PhSchema from './ph_schema'
import { withFormik } from 'formik'

const PhForm = withFormik({
  displayName: 'PhForm',
  mapPropsToValues: props => {
    let data = props.probe
    if (data === undefined) {
      data = {
        enable: true,
        config: {
          notify: {}
        }
      }
    }
    return {
      id: data.id || '',
      name: data.name || '',
      address: data.address || '99',
      enable: (data.enable === undefined ? true : data.enable),
      period: data.period || 60,
      alerts: (data.config.notify && data.config.notify.enable) || false,
      maxAlert: (data.config.notify && data.config.notify.max) || 0,
      minAlert: (data.config.notify && data.config.notify.min) || 0
    }
  },
  validationSchema: PhSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditPh)

export default PhForm
