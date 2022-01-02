import * as Yup from 'yup'
import mapValues from 'lodash.mapvalues'
import i18n from 'utils/i18n'

const LightSchema = Yup.object().shape({
  config: Yup.object().shape({
    name: Yup.string()
      .required(i18n.t('validation:name_required')),
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
    .required(i18n.t('validation:name_required')),
  min: Yup.number()
    .required(i18n.t('validation:number_required'))
    .typeError(i18n.t('validation:number_required'))
    .min(0, i18n.t('validation:integer_min_required'))
    .max(100, i18n.t('validation:integer_max_required')),
  max: Yup.number()
    .required(i18n.t('validation:number_required'))
    .typeError(i18n.t('validation:number_required'))
    .min(0, i18n.t('validation:integer_min_required'))
    .max(100, i18n.t('validation:integer_max_required')),
  // FIXME this is not touched when created and thus never shows the error
  // color: Yup.string().required(i18n.t('validation:selection_required')),
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
          type: Yup.string().required(i18n.t('validation:selection_required'))
        })
    }
  })
})

const diurnalSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  config: Yup.object()
    .typeError(i18n.t('validation:selection_required'))
    .shape({
      start: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      end: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required'))
    })
})

const fixedSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  config: Yup.object()
    .typeError(i18n.t('validation:selection_required'))
    .shape({
      value: Yup.number()
        .required(i18n.t('validation:number_required'))
        .typeError(i18n.t('validation:number_required'))
        .min(0, i18n.t('validation:integer_min_required'))
        .max(100, i18n.t('validation:integer_max_required')),
      start: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      end: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required'))
    })
})

const autoSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  config: Yup.object()
    .typeError(i18n.t('validation:selection_required'))
    .shape({
      start: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      end: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      values: Yup.array().of(Yup.number()
        .required(i18n.t('validation:number_required'))
        .typeError(i18n.t('validation:number_required'))
        .min(0, i18n.t('validation:integer_min_required'))
        .max(100, i18n.t('validation:integer_max_required'))
      )
    })
})

const randomSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  config: Yup.object()
    .typeError(i18n.t('validation:selection_required'))
    .shape({
      start: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      end: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required'))
    })
})

const sineSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  config: Yup.object()
    .typeError(i18n.t('validation:selection_required'))
    .shape({
      start: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      end: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required'))
    })
})

const lunarSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  config: Yup.object()
    .typeError(i18n.t('validation:selection_required'))
    .shape({
      start: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      end: Yup.string()
        .required(i18n.t('validation:time_required'))
        .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, i18n.t('validation:time_required')),
      full_moon: Yup.date()
        .required(i18n.t('validation:last_full_moon_required'))
        .typeError(i18n.t('validation:last_full_moon_required'))
        .max(new Date(), i18n.t('validation:last_full_moon_required'))
    })
})

export default LightSchema
