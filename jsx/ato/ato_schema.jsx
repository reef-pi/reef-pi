import * as Yup from 'yup'

const AtoSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  enable: Yup.bool()
    .required('ATO Status is required'),
  inlet: Yup.string()
    .required('Inlet is required'),
  period: Yup.number()
    .required('Check Frequency is required')
    .integer()
    .typeError('Check Frequency must be a number')
    .min(1, 'Check Frequency must be 1 second or greater'),
  pump: Yup.number(),
  notify: Yup.bool(),
  disable_on_alert: Yup.bool(),
  maxAlert: Yup.mixed()
    .when('notify', (notify, schema) => {
      if (notify === true) {
        return Yup
          .number()
          .required('Threshold is required when notification is enabled')
          .typeError('Threshold must be a number')
          .min(1, 'Check Frequency must be 1 second or greater')
      } else { return schema }
    })

})

export default AtoSchema
