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
      equipment_id: (timer.equipment && timer.equipment.id) || '',
      on: timer.equipment && (timer.equipment.on === undefined ? true : timer.equipment.on),
      duration: (timer.equipment && timer.equipment.duration) || '60',
      revert: (timer.equipment && timer.equipment.revert) || false,
      title: (timer.reminder && timer.reminder.title) || '',
      message: (timer.reminder && timer.reminder.message) || ''
    }
  },
  validationSchema: TimerSchema,
  handleSubmit: (values, {props}) => {
    props.onSubmit(values)
  }
})(EditTimer)

export default TimerForm
