import * as Yup from 'yup'

const PhSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  enable: Yup.bool()
    .required('Timer Status is required'),
  address: Yup.number()
    .required('Address is required'),
  period: Yup.number()
    .required('Check Frequency is required')
    .integer()
    .typeError('Check Frequency must be a number')
    .min(1, 'Check Frequency must be 1 second or greater'),
  alerts: Yup.bool()
    .required('Alerts is required'),
  minAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required('Threshold is required when alerts are enabled')
          .typeError('Threshold must be a number')
          .test('lessThan', 'Alert Below must be less than Alert Above', function (min) {
            return min < this.parent.maxAlert
          })
      } else { return schema }
    }),
  maxAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required('Threshold is required when alerts are enabled')
          .typeError('Threshold must be a number')
          .test('greaterThan', 'Alert Above must be greater than Alert Below', function (max) {
            return max > this.parent.minAlert
          })
      } else { return schema }
    })
})

export default PhSchema
