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

    // *** added chart Y min/max values - JFR 20201111
    // *** removed above after upstream change - JFR 20210111
    const value = {
      id: data.id || '',
      name: data.name || '',
      analog_input: data.analog_input || '',
      enable: (data.enable === undefined ? true : data.enable),
      period: data.period || 60,
      one_shot: data.one_shot || false,
      notify: data.notify.enable || false,
      maxAlert: (data.notify && data.notify.max) || 0,
      minAlert: (data.notify && data.notify.min) || 0,
      control: 'nothing',
      lowerThreshold: data.min || 0,
      lowerFunction: data.downer_eq || '',
      upperThreshold: data.max || 0,
      upperFunction: data.upper_eq || '',
      hysteresis: data.hysteresis || 0,
      chart: data.chart || { ymin: 0, ymax: 100, color: '#000', unit: '' }
    }

    if (data.control === true) {
      if (data.is_macro === true) { value.control = 'macro' } else { value.control = 'equipment' }
    }

    return value
  },
  validationSchema: PhSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditPh)

export default PhForm
