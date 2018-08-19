import React from 'react'
import PropTypes from 'prop-types'
import Diurnal from './diurnal_profile'
import Fixed from './fixed_profile'
import Auto from './auto_profile'

const Profile = (props) => {
  
  const handleChange = e => {
    const event = {
      target: {
        name: props.name + '.' + e.target.name,
        value: e.target.value
      }
    }

    props.onChangeHandler(event)
  }

  const handleConfigChange = e => {
    debugger;
  }

  if (props.type == 'fixed'){
    return (
      <Fixed 
        config={props.config} 
        onChangeHandler={handleChange} />
    )
  }
  else if (props.type == 'diurnal'){
    return (
      <Diurnal config={props.config} 
        onChangeHandler={handleChange} />
    )
  }
  else if (props.type == 'auto'){
    return (
      <Auto config={props.config} 
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
  config: PropTypes.object,
  onChangeHandler: PropTypes.func
}

export default Profile