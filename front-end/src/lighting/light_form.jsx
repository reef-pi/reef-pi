import Light from './light'
import LightSchema from './light_schema'
import { withFormik } from 'formik'

const LightForm = withFormik({
  displayName: 'LightForm',
  mapPropsToValues: props => {
    for (const x in props.config.channels) {
      if (props.config.channels[x].profile.type === 'auto') { props.config.channels[x].profile.type = 'interval' }
    }

    return {
      config: props.config
    }
  },
  validationSchema: LightSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(Light)

export default LightForm
