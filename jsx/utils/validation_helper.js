import React from 'react'
import PropTypes from 'prop-types'

export const ErrorFor = (props) => {
  
  const getErrors = () => {
    if (ShowError(props, props.name)){
      return ErrorMessage(props, props.name)
    }
    return null
  }

  const err = getErrors()
  if(err){
    return (
      <div className="invalid-feedback">{err}</div>
    )
  }
  return ''
}

ErrorFor.propTypes = {
  name: PropTypes.string.isRequired,
  errors: PropTypes.object
}

export const NameFor = (props, name) => {
  return props.name + '.' + name
}

export const ShowError = (props, name) => {
  var touched = PathToObject(name, props.touched)
  var err = PathToObject(name, props.errors)
  return touched && err
}

export const ErrorMessage = (props, name) => {
  var err = PathToObject(name, props.errors)
  if (typeof err === 'string' || err instanceof String){
    return err
  }
  else if (Array.isArray(err)){
    for(let i = 0; i < err.length; i++){
      if (err[i]) return err[i]
    }
  }
  return null
}

export const PathToObject = (path, obj) => {
  return path.split('.').reduce((o,i) => o && o[i], obj)
}

export default {ErrorFor, NameFor, ShowError, ErrorMessage, PathToObject}