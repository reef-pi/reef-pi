import * as Yup from 'yup'

const SettingsSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  interface: Yup.string().required('Network Interface is required'),
  address: Yup.string().required('Network address is required'),
  display: Yup.bool(),
  notification: Yup.bool(),
  capabilities: Yup.object().required('Capabilities is required'),
  health_check: Yup.object().shape({
    enable: Yup.bool(),
    max_memory: Yup.number().positive().integer(),
    max_cpu: Yup.number().positive().integer()
  }),
  https: Yup.bool(),
  pca9685: Yup.bool(),
  pprof: Yup.bool(),
  rpi_pwm_freq: Yup.number().positive().integer(),
  pca9685_pwm_freq: Yup.number().positive().integer()
})

export default SettingsSchema
