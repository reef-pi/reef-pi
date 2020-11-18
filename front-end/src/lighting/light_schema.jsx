import * as Yup from 'yup'
import mapValues from 'lodash.mapvalues'

const LightSchema = Yup.object().shape({
  config: Yup.object().shape({
    name: Yup.string()
      .required('Light Name is required'),
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
    .required('Channel Name is required'),
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
  profile: Yup.lazy(value => {
    switch (value.type) {
      case 'diurnal':
        return diurnalSchema
      case 'fixed':
        return fixedSchema
      case 'interval':
        return autoSchema
      case 'lunar':
        return lunarSchema
      case 'random':
        return randomSchema
      case 'sine':
        return sineSchema
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
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Start must be a valid time (HH:mm:ss)')
        .required('Start is required'),
      end: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'End must be a valid time (HH:mm:ss)')
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
        .required('Value is required'),
      start: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Start must be a valid time (HH:mm:ss)')
        .required('Start is required'),
      end: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'End must be a valid time (HH:mm:ss)')
        .required('End is required')
    })
})

const autoSchema = Yup.object().shape({
  type: Yup.string().required('Profile type is required'),
  config: Yup.object()
    .typeError('A profile must be configured')
    .shape({
      start: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Start must be a valid time (HH:mm:ss)')
        .required('Start is required'),
      end: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'End must be a valid time (HH:mm:ss)')
        .required('End is required'),
      values: Yup.array().of(Yup.number()
        .typeError('Value is required')
        .min(0, 'Value must be greater than or equal to 0')
        .max(100, 'Value must be less than or equal to 100')
        .required('Value is required')
      )
    })
})

const randomSchema = Yup.object().shape({
  type: Yup.string().required('Profile type is required'),
  config: Yup.object()
    .typeError('A profile must be configured')
    .shape({
      start: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Start must be a valid time (HH:mm:ss)')
        .required('Start is required'),
      end: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'End must be a valid time (HH:mm:ss)')
        .required('End is required')
    })
})

const sineSchema = Yup.object().shape({
  type: Yup.string().required('Profile type is required'),
  config: Yup.object()
    .typeError('A profile must be configured')
    .shape({
      start: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Start must be a valid time (HH:mm:ss)')
        .required('Start is required'),
      end: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'End must be a valid time (HH:mm:ss)')
        .required('End is required')
    })
})

const lunarSchema = Yup.object().shape({
  type: Yup.string().required('Profile type is required'),
  config: Yup.object()
    .typeError('A profile must be configured')
    .shape({
      start: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Start must be a valid time (HH:mm:ss)')
        .required('Start is required'),
      end: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'End must be a valid time (HH:mm:ss)')
        .required('End is required'),
      full_moon: Yup.date()
        .max(new Date(), 'Full Moon must be in the past')
        .required('Date of the full moon is required')
        .typeError('Full Moon is required')
    })
})

export default LightSchema
