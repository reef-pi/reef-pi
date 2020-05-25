import React from 'react'
import { useField, useFormikContext } from 'formik'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import i18n from 'i18next'

import { en, fr, es, pt, de, it, hi, fa, zh } from 'date-fns/locale'

registerLocale('en', en)
registerLocale('fr', fr)
registerLocale('es', es)
registerLocale('pt', pt)
registerLocale('de', de)
registerLocale('it', it)
registerLocale('hi', hi)
registerLocale('fa', fa)
registerLocale('zh', zh)

const DatePickerField = ({ ...props }) => {
  const { setFieldValue } = useFormikContext()
  const [field] = useField(props)
  return (
    <DatePicker
      {...field}
      {...props}
      locale={i18n.language}
      selected={(field.value && new Date(field.value)) || null}
      onChange={val => {
        setFieldValue(field.name, val)
      }}
    />
  )
}

export default DatePickerField
