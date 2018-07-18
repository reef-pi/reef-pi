import React from 'react'
import PropTypes from 'prop-types'
import FixedProfile from 'lighting/fixed_profile'
import AutoProfile from 'lighting/auto_profile'
import DiurnalProfile from 'lighting/diurnal_profile'

export default class Profile extends React.Component {
  constructor (props) {
    super(props)
    console.log(props)
    this.setConfig = this.setConfig.bind(this)
    this.setType = this.setType.bind(this)
    this.ui = this.ui.bind(this)
  }

  setType (k) {
    return () => {
      var p = {
        type: k,
        config: this.props.config
      }
      this.props.hook(p)
    }
  }

  setConfig (c) {
    var p = {
      type: this.props.type,
      config: c
    }
    this.props.hook(p)
  }

  ui () {
    switch (this.props.type) {
      case 'fixed':
        return (
          <FixedProfile
            config={this.props.config}
            hook={this.setConfig}
            readOnly={this.props.readOnly}
          />
        )
      case 'auto':
        return (
          <AutoProfile
            config={this.props.config}
            hook={this.setConfig}
            readOnly={this.props.readOnly}
          />
        )
      case 'diurnal':
        return (
          <DiurnalProfile
            config={this.props.config}
            hook={this.setConfig}
            readOnly={this.props.readOnly}
          />
        )
      default:
        return (<span> unknown profile{this.props.type}</span>)
    }
  }

  render () {
    return (
      <div className='container'>
        <label>Profile</label>
        <div className='btn-group'>
          <label className='btn btn-secondary'>
            <input
              type='radio'
              name={this.props.name}
              id='fixed'
              onClick={this.setType('fixed')}
              defaultChecked={this.props.type === 'fixed'}
              disabled={this.props.readOnly}
            />
            Fixed
          </label>
          <label className='btn btn-secondary'>
            <input
              type='radio'
              name={this.props.name}
              id='auto'
              onClick={this.setType('auto')}
              defaultChecked={this.props.type === 'auto'}
              disabled={this.props.readOnly}
            />
            Auto
          </label>
          <label className='btn btn-secondary'>
            <input
              type='radio'
              name={this.props.name}
              id='diurnal'
              onClick={this.setType('diurnal')}
              defaultChecked={this.props.type === 'diurnal'}
              disabled={this.props.readOnly}
            />
            Diurnal
          </label>
        </div>
        {this.ui()}
      </div>
    )
  }
}

Profile.propTypes = {
  type: PropTypes.string,
  config: PropTypes.object,
  hook: PropTypes.func,
  name: PropTypes.string,
  readOnly: PropTypes.bool
}
