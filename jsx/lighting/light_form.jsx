import Light from './light'
import LightSchema from './light_schema'
import { withFormik } from 'formik'

const LightForm = withFormik({
  mapPropsToValues: props => ({config: props.config, remove: props.remove}),
  validationSchema: LightSchema,
  handleSubmit: (values, formikBag) => {
    const payload = {
      name: values.config.name,
      channels: values.config.channels,
      jack: values.config.jack
    }
    for (let x in payload.channels) {
      payload.channels[x].reverse = (payload.channels[x].reverse === 'true' || payload.channels[x].reverse === true)
    }
    formikBag.props.save(values.config.id, payload)
  }
})(Light)

export default LightForm
