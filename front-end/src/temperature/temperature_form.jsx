import EditTemperature from './edit_temperature'
import TemperatureSchema from './temperature_schema'
import { withFormik } from 'formik'

export const mapTemperaturePropsToValues = props => {
  let tc = props.tc
  if (tc === undefined) {
    tc = {
      enable: true,
      fahrenheit: true,
      notify: {},
      chart: { ymax: 86, ymin: 74, color: '#000' }
    }
  }

  const values = {
    id: tc.id || '',
    name: tc.name || '',
    sensor: tc.sensor || '',
    analog_input: tc.analog_input || '',
    one_shot: tc.one_shot || false,
    fahrenheit: (tc.fahrenheit === undefined ? true : tc.fahrenheit),
    period: tc.period || '60',
    enable: (tc.enable === undefined ? true : tc.enable),
    alerts: (tc.notify && tc.notify.enable) || false,
    minAlert: (tc.notify && tc.notify.min) || '77',
    maxAlert: (tc.notify && tc.notify.max) || '81',
    fail_safe: tc.fail_safe || false,
    heater: tc.heater || '',
    min: tc.min || '',
    hysteresis: tc.hysteresis || 0,
    cooler: tc.cooler || '',
    max: tc.max || '',
    control: '',
    chart: tc.chart || { ymax: 86, ymin: 74, color: '#000' }
  }

  if (tc.control === true) {
    if (tc.is_macro === true) { values.control = 'macro' } else { values.control = 'equipment' }
  }

  return values
}

export const submitTemperatureForm = (values, { props }) => {
  props.onSubmit(values)
}

const TemperatureForm = withFormik({
  displayName: 'TemperatureForm',
  mapPropsToValues: mapTemperaturePropsToValues,
  validationSchema: TemperatureSchema,
  handleSubmit: submitTemperatureForm
})(EditTemperature)

export default TemperatureForm
