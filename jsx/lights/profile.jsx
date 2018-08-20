import React from 'react'
import PropTypes from 'prop-types'
import Diurnal from './diurnal_profile'
import Fixed from './fixed_profile'
import Auto from './auto_profile'

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
        name="config"
        readOnly={props.readOnly}
        config={props.config} 
        onChangeHandler={handleConfigChange} />
    )
  }
  else if (props.type == 'diurnal'){
    return (
      <Diurnal name="config"
        readOnly={props.readOnly}
        config={props.config} 
        onChangeHandler={handleConfigChange} />
    )
  }
  else if (props.type == 'auto'){
    return (
      <Auto
        name="config" 
        readOnly={props.readOnly}
        config={props.config} 
        onChangeHandler={handleConfigChange} />
    )
  }
  else{
    return (
      <div>Please select a profile.</div>
    )
  }  
}

Profile.propTypes = {
  type: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  config: PropTypes.object,
  onChangeHandler: PropTypes.func
}

export default Profile