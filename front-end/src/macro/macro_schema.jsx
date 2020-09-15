import * as Yup from 'yup'

const EmptySchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required')
})

const WaitSchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required'),
  duration: Yup.number()
    .required('Duration is required')
    .integer()
    .typeError('Duration is required')
    .min(1, 'Duration must be 1 second or greater')
})
const AlertSchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required'),
  title: Yup.string()
    .required('Step title is required'),
  message: Yup.string()
    .required('Step message is required')
})

const GenericSchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required'),
  id: Yup.string()
    .required('System is required'),
  on: Yup.bool()
    .required('Action is required')
    .typeError('Action is required')
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
    .required('Name is required'),
  reversible: Yup.bool()
    .required('reversible is required'),
  steps: Yup.array().of(StepSchema)
    .required('Macros must have at least 1 step')
})

export default MacroSchema
