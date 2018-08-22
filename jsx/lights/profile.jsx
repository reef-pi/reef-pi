import React from 'react'
import PropTypes from 'prop-types'
import Diurnal from './diurnal_profile'
import Fixed from './fixed_profile'
import Auto from './auto_profile'
import {ErrorFor, NameFor, ShowError} from '../utils/validation_helper'   

const Profile = (props) => {
  
  const handleConfigChange = e => {
    const event = {
      target: {
        name: props.name,
        value: e
      }
    }
    props.onChangeHandler(event)
  }

  if (props.type == 'fixed'){
    return (
      <Fixed 
        {...props}
        readOnly={props.readOnly}
        config={props.value} 
        onChangeHandler={handleConfigChange} />
    )
  }
  else if (props.type == 'diurnal'){
    return (
      <Diurnal
        {...props}
        value={props.value}
        readOnly={props.readOnly}
        onChange={props.onChangeHandler} />
    )
  }
  else if (props.type == 'auto'){
    return (
      <Auto
        {...props}
        readOnly={props.readOnly}
        config={props.value} 
        onChangeHandler={handleConfigChange} />
    )
  }
  else{
    return ''
  }  
}

Profile.propTypes = {
  type: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  config: PropTypes.object,
  onChangeHandler: PropTypes.func
}

export default Profile