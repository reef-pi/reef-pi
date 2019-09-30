import EditTemperature from './edit_temperature'
import TemperatureSchema from './temperature_schema'
import { withFormik } from 'formik'

const TemperatureForm = withFormik({
  displayName: 'TemperatureForm',
  mapPropsToValues: props => {
    let tc = props.tc
    if (tc === undefined) {
      tc = {
        enable: true,
        fahrenheit: true,
        notify: {}
      }
    }

    return {
      id: tc.id || '',
      name: tc.name || '',
      sensor: tc.sensor || '',
      fahrenheit: (tc.fahrenheit === undefined ? true : tc.fahrenheit),
      period: tc.period || '60',
      enable: (tc.enable === undefined ? true : tc.enable),
      alerts: (tc.notify && tc.notify.enable) || false,
      minAlert: (tc.notify && tc.notify.min) || '77',
      maxAlert: (tc.notify && tc.notify.max) || '81',
      heater: tc.heater || '',
      min: tc.min || '',
      cooler: tc.cooler || '',
      max: tc.max || '',
      chart_min: tc.chart_min || '70',
      chart_max: tc.chart_max || '90'
    }
  },
  validationSchema: TemperatureSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditTemperature)

export default TemperatureForm
