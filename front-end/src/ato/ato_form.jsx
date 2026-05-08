import EditAto from './edit_ato'
import AtoSchema from './ato_schema'
import { withFormik } from 'formik'

export const atoControlValue = data => {
  if (data.control !== true) {
    return ''
  }
  return data.is_macro === true ? 'macro' : 'equipment'
}

export const mapAtoPropsToValues = props => {
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
    control: atoControlValue(data),
    inlet: data.inlet || '',
    one_shot: data.one_shot || false,
    disable_on_alert: data.disable_on_alert || false,
    period: data.period || 60,
    debounce: data.debounce || 0,
    pump: data.pump || '',
    notify: (data.notify && data.notify.enable) || false,
    maxAlert: (data.notify && data.notify.max) || 120
  }
}

export const submitAtoForm = (values, props) => {
  props.onSubmit(values)
}

const AtoForm = withFormik({
  displayName: 'AtoForm',
  mapPropsToValues: mapAtoPropsToValues,
  validationSchema: AtoSchema,
  handleSubmit: (values, { props }) => {
    submitAtoForm(values, props)
  }
})(EditAto)

export default AtoForm
