import EditEntry from './edit_entry'
import EntrySchema from './schema'
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
      id: data.id || '',
      value: data.value || '',
      comment: data.comment || '',
      timestamp: data.timestamp || ''
    }
    return values
  },
  validationSchema: EntrySchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditEntry)

export default EntryForm
