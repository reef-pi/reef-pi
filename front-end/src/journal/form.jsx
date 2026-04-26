import EditJournal from './edit_journal'
import JournalSchema from './schema'
import { withFormik } from 'formik'

export const mapJournalPropsToValues = props => {
  let data = props.data
  if (data === undefined) {
    data = {
      name: '',
      description: '',
      unit: ''
    }
  }
  const values = {
    name: data.name || '',
    description: data.description || '',
    unit: data.unit || ''
  }
  return values
}

export const submitJournalForm = (values, props) => {
  props.onSubmit(values)
}

const JournalForm = withFormik({
  displayName: 'JournalForm',
  mapPropsToValues: mapJournalPropsToValues,
  validationSchema: JournalSchema,
  handleSubmit: (values, { props }) => {
    submitJournalForm(values, props)
  }
})(EditJournal)

export default JournalForm
