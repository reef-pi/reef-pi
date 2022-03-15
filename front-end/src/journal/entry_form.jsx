import EditEntry from './edit_entry'
import EntrySchema from './entry_schema'
import { withFormik } from 'formik'

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const EntryForm = withFormik({
  displayName: 'EntryForm',
  mapPropsToValues: props => {
    let data = props.data

    const today = new Date()
    // teletime format: Jan-02-15:04, 2006
    let dateStr = months[today.getMonth()] + '-'
    dateStr += today.getDate().toString().padStart(2, '0') + '-'
    dateStr += today.getHours().toString().padStart(2, '0') + ':'
    dateStr += today.getMinutes().toString().padStart(2, '0') + ', '
    dateStr += today.getFullYear()

    if (data === undefined) {
      data = {
        value: '',
        comment: '',
        timestamp: dateStr
      }
    }
    const values = {
      value: data.value || '',
      comment: data.comment || '',
      timestamp: data.timestamp || dateStr
    }
    return values
  },
  validationSchema: EntrySchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditEntry)

export default EntryForm
