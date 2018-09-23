import EditTemperature from './edit_temperature'
import TemperatureSchema from './temperature_schema'
import { withFormik } from 'formik'

const TemperatureForm = withFormik({
  displayName: 'TemperatureForm',
  mapPropsToValues: props => ({
    id: (props.tc && props.tc.id) || '',
    name: (props.tc && props.tc.name) || '',
    sensor: (props.tc && props.tc.sensor) || '',
    fahrenheit: props.tc && (props.tc.fahrenheit === undefined ? true : props.tc.fahrenheit),
    period: (props.tc && props.tc.period) || '60',
    enable: props.tc && (props.tc.enable === undefined ? true : props.tc.enable),
    alerts: (props.tc && props.tc.notify && props.tc.notify.enable) || false,
    minAlert: (props.tc && props.tc.notify && props.tc.notify.min) || '77',
    maxAlert: (props.tc && props.tc.notify && props.tc.notify.max) || '81',
    heater: (props.tc && props.tc.heater) || '',
    min: (props.tc && props.tc.min) || '',
    cooler: (props.tc && props.tc.cooler) || '',
    max: (props.tc && props.tc.max) || '',
    chart_min: (props.tc && props.tc.chart_min) || '70',
    chart_max: (props.tc && props.tc.chart_max) || '90'
  }),
  validationSchema: TemperatureSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditTemperature)

export default TemperatureForm
