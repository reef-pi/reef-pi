import React from 'react'

const BooleanSelect = props => {
  const { field, children, ...other } = props

  const handleChange = e => {
    const val = (e.target.value === true || e.target.value === 'true')
    const event = {
      target: {
        name: e.target.name,
        value: val
      }
    }
    field.onChange(event)
  }

  return (
    <select
      {...field}
      {...other}
      onChange={handleChange}
    >
      {children}
    </select>
  )
}

export default BooleanSelect
