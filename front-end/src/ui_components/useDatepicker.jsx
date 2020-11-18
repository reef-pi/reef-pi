import { isValid } from 'date-fns'
import { useFormikContext } from 'formik'

export const useDatepicker = name => {
  const { setFieldValue, setFieldTouched } = useFormikContext()
  const handleChangeRaw = e => {
    const { name, value } = e.target
    const validChars = /^\d{0,2}[./]{0,1}\d{0,2}[./]{0,1}\d{0,4}$/
    if (!validChars.test(value)) {
      e.preventDefault()
    }

    if (isValid(new Date(value))) {
      setFieldValue(name, value)
      setFieldTouched(name, true)
    }
  }

  const handleChange = async date => {
    const dateInstance = new Date(date)

    if (date && isValid(dateInstance)) {
      await setFieldValue(name, dateInstance)
    } else {
      await setFieldValue(name, '')
    }

    setFieldTouched(name, true)
  }

  return [
    handleChangeRaw,
    handleChange
  ]
}
