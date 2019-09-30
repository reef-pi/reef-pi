import Light from './light'
import LightSchema from './light_schema'
import { withFormik } from 'formik'

const LightForm = withFormik({
  displayName: 'LightForm',
  mapPropsToValues: props => ({ config: props.config }),
  validationSchema: LightSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(Light)

export default LightForm
