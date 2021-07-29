import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import i18next from 'i18next'

const SelectType = ({ name, className, readOnly }) => {
  const list = () => {
    const validTypes = ['alert', 'wait', 'equipment', 'ato', 'temperature', 'doser', 'timers', 'phprobes', 'subsystem', 'macro']
    return validTypes.map(item => {
      return (
        <option key={item} value={item}>
          {item}
        </option>
      )
    })
  }

  return (
    <Field
      name={name}
      component='select'
      className={`form-control ${className}`}
      disabled={readOnly}
    >
      <option value='' className='d-none'>-- {i18next.t('select')} --</option>
      {list()}
    </Field>
  )
}

SelectType.propTypes = {
  readOnly: PropTypes.bool,
  name: PropTypes.string,
  className: PropTypes.string
}

export default SelectType
