import EditTimer from './edit_timer'
import TimerSchema from './timer_schema'
import { withFormik } from 'formik'

const TimerForm = withFormik({
  displayName: 'TimerForm',
  mapPropsToValues: props => {
    let timer = props.timer
    if (timer === undefined) {
      timer = {
        enable: true,
        equipment: {},
        macros: {}
      }
    }

    return {
      id: timer.id || '',
      name: timer.name || '',
      enable: (timer.enable === undefined ? true : timer.enable),
      day: timer.day || '*',
      hour: timer.hour || '*',
      minute: timer.minute || '*',
      second: timer.second || '0',
      type: timer.type || 'equipment',
      target: timer.target || {}
    }
  },
  validationSchema: TimerSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditTimer)

export default TimerForm
