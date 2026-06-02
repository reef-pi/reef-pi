import React from 'react'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

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
      const config = {
        ...this.state.config,
        [label]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value
      }
      config.qos = parseInt(config.qos)
      this.setState({ config })
      this.props.update(config)
    }.bind(this)
  }

  handleUpdateEnable (ev) {
    const config = {
      ...this.state.config,
      enable: ev.target.checked
    }
    this.setState({ config })
    this.props.update(config)
  }

  toRow (label, text, iType) {
    if (!this.state.config.enable) {
      return
    }
    return (
      <FormField key={'telemetry-' + label} label={text}>
        <Input
          type={iType}
          {...(iType === 'checkbox'
            ? { checked: this.state.config[label] }
            : { value: this.state.config[label] })}
          onChange={this.onChange(label)}
          id={'telemetry-mqtt-' + label}
        />
      </FormField>
    )
  }

  render () {
    return (
      <>
        <div style={{ marginBottom: 'var(--reefpi-space-sm)' }} key='telemetry-mqtt-enable'>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-xs)' }}>
            <input
              type='checkbox'
              defaultChecked={this.state.config.enable}
              onClick={this.handleUpdateEnable}
            />
            <b>MQTT</b>
          </label>
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
