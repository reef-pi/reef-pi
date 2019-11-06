import React from 'react'
import PropTypes from 'prop-types'

export const ErrorFor = ({ name, errors, touched }) => {
  const getErrors = () => {
    if (ShowError(name, touched, errors)) {
      return ErrorMessage(errors, name)
    }
    return null
  }

  const err = getErrors()
  if (err) {
    return (
      <div className='invalid-feedback'>{err}</div>
    )
  }
  return ''
}

ErrorFor.propTypes = {
  name: PropTypes.string.isRequired,
  errors: PropTypes.object
}

export const NameFor = (name, fieldName) => {
  return name + '.' + fieldName
}

export const ShowError = (name, touched, errors) => {
  const fieldTouched = PathToObject(name, touched)
  const err = PathToObject(name, errors)
  return fieldTouched && err
}

export const ErrorMessage = (errors, name) => {
  const err = PathToObject(name, errors)
  if (typeof err === 'string' || err instanceof String) {
    return err
  } else if (Array.isArray(err)) {
    for (let i = 0; i < err.length; i++) {
      if (err[i] && (typeof err[i] === 'string' || err[i] instanceof String)) return err[i]
    }
  }
  return null
}

export const PathToObject = (path, obj) => {
  return path.split('.').reduce((o, i) => o && o[i], obj)
}

export default { ErrorFor, NameFor, ShowError, ErrorMessage, PathToObject }
