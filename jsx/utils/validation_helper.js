import React from 'react'
import PropTypes from 'prop-types'

export const ErrorFor = (props) => {
  
  const getErrors = () => {
    if (props.name == 'config.channels.4.profile.config.value') console.log('Getting Errors for ' + props.name)
    if (ShowError(props, props.name)){
      if (props.name == 'config.channels.4.profile.config.value') console.log('Should show')
      return ErrorMessage(props, props.name)
    }
    if (props.name == 'config.channels.4.profile.config.value') console.log('Should not show')
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
  if (props.name == 'config.channels.4.profile.config.value') console.log('Touched is ' + touched)
  if (props.name == 'config.channels.4.profile.config.value') console.log('Err is ' + err)
  return touched && err
}

export const ErrorMessage = (props, name) => {
  var err = PathToObject(name, props.errors)
  if (props.name == 'config.channels.4.profile.config.value') console.log('Error is ' + err)
  if (typeof err === 'string' || err instanceof String)
    return err
  return null
}

export const PathToObject = (path, obj) => {
  return path.split('.').reduce((o,i) => o && o[i], obj)
}

export default {ErrorFor, NameFor, ShowError, ErrorMessage, PathToObject}