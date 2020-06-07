import React from 'react'
import { useField, useFormikContext } from 'formik'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import i18n from 'i18next'

import { enUS, fr, es, pt, de, it, hi, faIR, zhCN } from 'date-fns/locale'

registerLocale('en', enUS)
registerLocale('fr', fr)
registerLocale('es', es)
registerLocale('pt', pt)
registerLocale('de', de)
registerLocale('it', it)
registerLocale('hi', hi)
registerLocale('fa', faIR)
registerLocale('zh', zhCN)

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
