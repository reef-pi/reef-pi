import EditEntry from './edit_entry'
import EntrySchema from './entry_schema'
import { withFormik } from 'formik'

const EntryForm = withFormik({
  displayName: 'EntryForm',
  mapPropsToValues: props => {
    let data = props.data
    if (data === undefined) {
      data = {
        value: '',
        comment: '',
        timestamp: ''
      }
    }
    const values = {
      value: data.value || '',
      comment: data.comment || '',
      timestamp: data.timestamp || ''
    }
    return values
  },
  validationSchema: EntrySchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(props.journal.id, values)
  }
})(EditEntry)

export default EntryForm
