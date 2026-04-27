import Light from './light'
import LightSchema from './light_schema'
import { withFormik } from 'formik'

export const mapLightPropsToValues = props => {
  for (const x in props.config.channels) {
    if (props.config.channels[x].profile.type === 'auto') { props.config.channels[x].profile.type = 'interval' }
  }

  return {
    config: props.config
  }
}

export const submitLightForm = (values, { props }) => {
  props.onSubmit(values)
}

const LightForm = withFormik({
  displayName: 'LightForm',
  mapPropsToValues: mapLightPropsToValues,
  validationSchema: LightSchema,
  handleSubmit: submitLightForm
})(Light)

export default LightForm
