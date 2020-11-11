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

    // *** added chart Y min/max values - JFR 20201110
    const values = {
      id: tc.id || '',
      name: tc.name || '',
      sensor: tc.sensor || '',
      one_shot: tc.one_shot || false,
      fahrenheit: (tc.fahrenheit === undefined ? true : tc.fahrenheit),
      period: tc.period || '60',
      enable: (tc.enable === undefined ? true : tc.enable),
      alerts: (tc.notify && tc.notify.enable) || false,
      minAlert: (tc.notify && tc.notify.min) || '77',
      maxAlert: (tc.notify && tc.notify.max) || '81',
      heater: tc.heater || '',
      min: tc.min || '',
      hysteresis: tc.hysteresis || 0,
      cooler: tc.cooler || '',
      max: tc.max || '',
      control: 'nothing',
      chart_y_min: tc.chart_y_min || 0,
      chart_y_max: tc.chart_y_max || 100
    }

    if (tc.control === true) {
      if (tc.is_macro === true) { values.control = 'macro' } else { values.control = 'equipment' }
    }

    return values
  },
  validationSchema: TemperatureSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditTemperature)

export default TemperatureForm
