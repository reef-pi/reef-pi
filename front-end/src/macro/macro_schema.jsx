import * as Yup from 'yup'
import i18n from 'utils/i18n'

const EmptySchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required'))
})

const WaitSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  duration: Yup.number()
    .required(i18n.t('validation:number_required'))
    .integer(i18n.t('validation:number_required'))
    .min(1, i18n.t('validation:integer_min_required'))
})

const AlertSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  title: Yup.string()
    .required(i18n.t('validation:entry_required')),
  message: Yup.string()
    .required(i18n.t('validation:entry_required'))
})

const GenericSchema = Yup.object().shape({
  type: Yup.string()
    .required(i18n.t('validation:selection_required')),
  id: Yup.string()
    .required(i18n.t('validation:selection_required')),
  on: Yup.bool()
    .required(i18n.t('validation:selection_required'))
})

const StepSchema = Yup.lazy(value => {
  switch (value.type) {
    case undefined:
      return EmptySchema
    case 'wait':
      return WaitSchema
    case 'alert':
      return AlertSchema
    default:
      return GenericSchema
  }
})

const MacroSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18n.t('validation:name_required')),
  reversible: Yup.bool(),
  steps: Yup.array().of(StepSchema)
    .required(i18n.t('macro:one_step_required'))
    //FIXME: should be added, but smoke test fails then
    .length(1, i18n.t('macro:one_step_required'))
})

export default MacroSchema
