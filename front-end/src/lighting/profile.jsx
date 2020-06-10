import React from 'react'
import PropTypes from 'prop-types'
import Diurnal from './diurnal_profile'
import Fixed from './fixed_profile'
import Auto from './auto_profile'
import Random from './random_profile'
import Lunar from './lunar_profile'
import Sine from './sine_profile'

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

  switch (props.type) {
    case 'fixed': {
      return (
        <Fixed
          {...props}
          readOnly={props.readOnly}
          config={props.value}
          onChangeHandler={handleConfigChange}
        />
      )
    }
    case 'diurnal': {
      return (
        <Diurnal
          {...props}
          value={props.value}
          readOnly={props.readOnly}
          onChange={props.onChangeHandler}
        />
      )
    }
    case 'interval': {
      return (
        <Auto
          {...props}
          readOnly={props.readOnly}
          config={props.value}
          onChangeHandler={handleConfigChange}
        />
      )
    }
    case 'random': {
      return (
        <Random
          {...props}
          readOnly={props.readOnly}
          config={props.value}
          onChangeHandler={handleConfigChange}
        />
      )
    }
    case 'sine': {
      return (
        <Sine
          {...props}
          readOnly={props.readOnly}
          config={props.value}
          onChangeHandler={handleConfigChange}
        />
      )
    }
    case 'lunar': {
      return (
        <Lunar
          {...props}
          readOnly={props.readOnly}
          config={props.value}
          onChangeHandler={handleConfigChange}
        />
      )
    }
    default: {
      return (<span>Unknown Profile: {props.type}</span>)
    }
  }
}

Profile.propTypes = {
  type: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  config: PropTypes.object,
  onChangeHandler: PropTypes.func
}

export default Profile
