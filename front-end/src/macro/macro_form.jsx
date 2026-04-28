import EditMacro from './edit_macro'
import MacroSchema from './macro_schema'
import { withFormik } from 'formik'

export const mapMacroPropsToValues = props => {
  let data = props.macro
  if (data === undefined) {
    data = {
      steps: []
    }
  }
  if (!data.steps) { data.steps = [] }

  return {
    id: data.id || '',
    name: data.name || '',
    enable: data.enable || false,
    reversible: data.reversible || false,
    steps: data.steps.map(step => {
      return {
        type: step.type,
        duration: step.config.duration,
        id: step.config.id,
        on: step.config.on,
        title: step.config.title,
        message: step.config.message
      }
    })
  }
}

export const submitMacroForm = (values, props) => {
  props.onSubmit(values)
}

const MacroForm = withFormik({
  displayName: 'MacroForm',
  mapPropsToValues: mapMacroPropsToValues,
  validationSchema: MacroSchema,
  handleSubmit: (values, { props }) => {
    submitMacroForm(values, props)
  }
})(EditMacro)

export default MacroForm
