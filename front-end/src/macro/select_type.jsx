import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import i18n from 'utils/i18n'

const SelectType = ({ name, className, readOnly }) => {
  const list = () => {
    const validTypes = ['alert', 'wait', 'equipment', 'ato', 'temperature', 'lightings', 'doser', 'timers', 'phprobes', 'subsystem', 'macro']
    // capabilities:..  are the subsytem names (plural or cathegory), correspinding to the tab pages, whereas
    // function:... are individual devices in these cathegories
    return validTypes.map((item) => {
      return (
        <option key={item} value={item}>
          {i18n.t('function:' + item)}
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
      <option value='' className='d-none'>-- {i18n.t('select')} --</option>
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
