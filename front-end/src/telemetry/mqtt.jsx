import React from 'react'

export default class Mqtt extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: this.props.config
    }
    this.handleUpdateEnable = this.handleUpdateEnable.bind(this)
    this.toRow = this.toRow.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onChange (label) {
    return function (ev) {
      const config = this.state.config
      config[label] = ev.target.value
      config.qos = parseInt(config.qos)
      this.setState({ config: config })
      this.props.update(this.state.config)
    }.bind(this)
  }

  handleUpdateEnable (ev) {
    const config = this.state.config
    config.enable = ev.target.checked
    this.setState({ config: config })
    this.props.update(this.state.config)
  }

  toRow (label, text, iType) {
    if (!this.state.config.enable) {
      return
    }
    return (
      <div className='form-group col-md-4 col-sm-12' key={'telemetry-' + label}>
        <label htmlFor={'telemetry-mqtt-' + label}>{text}</label>
        <input
          type={iType}
          value={this.state.config[label]}
          onChange={this.onChange(label)}
          id={'telemetry-mqtt-' + label}
          className='form-control'
        />
      </div>
    )
  }

  render () {
    return (
      <>
        <div className=' col-12' key='telemetry-mqtt-enable'>
          <div className='form-group'>
            <label className='form-check-label'>
              <input
                className='form-check-input'
                type='checkbox'
                defaultChecked={this.state.config.enable}
                onClick={this.handleUpdateEnable}
              />
              <b>MQTT</b>
            </label>
          </div>
        </div>
        {this.toRow('server', 'Server', 'text')}
        {this.toRow('username', 'Username', 'text')}
        {this.toRow('client_id', 'Client ID', 'text')}
        {this.toRow('password', 'Password', 'password')}
        {this.toRow('qos', 'QoS', 'number')}
        {this.toRow('prefix', 'Topic Prefix', 'text')}
        {this.toRow('retained', 'Retained', 'checkbox')}
      </>
    )
  }
}
