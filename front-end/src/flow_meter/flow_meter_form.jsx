import EditFlowMeter from './edit_flow_meter'
import FlowMeterSchema from './flow_meter_schema'
import { withFormik } from 'formik'

const FlowMeterForm = withFormik({
  displayName: 'FlowMeterForm',

  mapPropsToValues: props => {
    const fm = props.flow_meter || {}
    return {
      id: fm.id || '',
      name: fm.name || '',
      enable: fm.enable !== undefined ? fm.enable : true,
      sensor: fm.sensor || '',
      pulses_per_liter: fm.pulses_per_liter || 450,
      period: fm.period || 60,
      notify_enable: (fm.notify && fm.notify.enable) || false,
      notify_min: (fm.notify && fm.notify.min) || 0
    }
  },

  validationSchema: FlowMeterSchema,

  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditFlowMeter)

export default FlowMeterForm
