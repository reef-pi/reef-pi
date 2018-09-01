import * as Yup from 'yup'

const LightSchema = Yup.object().shape({
  config: Yup.object().shape({
    channels: Yup.lazy(obj =>
      Yup.object(
        mapValues(obj, () => {
          return channelSchema
        })
      )
    )
  })
})

const channelSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  reverse: Yup.boolean()
    .required('Behavior is required'),
  min: Yup.number()
    .typeError('Min is required')
    .min(0, 'Min must be greater than or equal to 0')
    .max(100, 'Min must be less than or equal to 100')
    .required('Min is required'),
  max: Yup.number()
    .typeError('Max is required')
    .min(0, 'Max must be greater than or equal to 0')
    .max(100, 'Max must be less than or equal to 100')
    .required('Max is required'),
  start_min: Yup.number()
    .typeError('Start is required')
    .min(0, 'Start must be greater than or equal to 0')
    .max(100, 'Start must be less than or equal to 100')
    .required('Start is required'),
  profile: Yup.lazy(value => {
    switch (value.type) {
      case 'diurnal':
        return diurnalSchema
      case 'fixed':
        return fixedSchema
      case 'auto':
        return autoSchema
      default:
        return Yup.object().shape({
          type: Yup.string().required('Profile type is required')
        })
    }
  })
})

const diurnalSchema = Yup.object().shape({
  type: Yup.string().required('Profile type is required'),
  config: Yup.object()
    .typeError('A profile must be configured')
    .shape({
      start: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start must be a valid time (HH:mm)')
        .required('Start is required'),
      end: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End must be a valid time (HH:mm)')
        .required('End is required')
    })
})

const fixedSchema = Yup.object().shape({
  type: Yup.string().required('Profile type is required'),
  config: Yup.object()
    .typeError('A profile must be configured')
    .shape({
      value: Yup.number()
        .typeError('Value is required')
        .min(0, 'Value must be greater than or equal to 0')
        .max(100, 'Value must be less than or equal to 100')
        .required('Value is required')
    })
})

const autoSchema = Yup.object().shape({
  type: Yup.string().required('Profile type is required'),
  config: Yup.object()
    .typeError('A profile must be configured')
    .shape({
      values: Yup.array().of(Yup.number()
        .typeError('Value is required')
        .min(0, 'Value must be greater than or equal to 0')
        .max(100, 'Value must be less than or equal to 100')
        .required('Value is required')
      )
    })
})

export default LightSchema
