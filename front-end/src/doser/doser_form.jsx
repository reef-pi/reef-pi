import EditDoser from './edit_doser'
import DoserSchema from './doser_schema'
import { withFormik } from 'formik'

const DoserForm = withFormik({
  displayName: 'DoserForm',

  mapPropsToValues: props => {
    let data = props.doser
    if (data === undefined) {
      data = {
        regiment: {
          schedule: {}
        }
      }
    }

    return {
      id: data.id || '',
      name: data.name || '',
      jack: data.jack || '',
      pin: data.pin === undefined ? '' : data.pin,
      enable: data.regiment.enable === undefined ? true : data.regiment.enable,
      duration: data.regiment.duration || 0,
      volume: data.regiment.volume || 0,
      speed: data.regiment.speed || 0,
      month: data.regiment.schedule.month || '*',
      week: data.regiment.schedule.week || '*',
      day: data.regiment.schedule.day || '*',
      hour: data.regiment.schedule.hour || '0',
      minute: data.regiment.schedule.minute || '0',
      second: data.regiment.schedule.second || '0',
      type: data.type || '',
      stepper: data.stepper || {}
    }
  },
  validationSchema: DoserSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditDoser)

export default DoserForm
