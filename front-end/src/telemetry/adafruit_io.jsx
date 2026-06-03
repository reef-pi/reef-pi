import React from 'react'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export default class AdafruitIO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      adafruitio: this.props.adafruitio
    }
    this.handleUpdateEnable = this.handleUpdateEnable.bind(this)
    this.toRow = this.toRow.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onChange (label) {
    return function (ev) {
      const adafruitio = {
        ...this.state.adafruitio,
        [label]: ev.target.value
      }
      this.setState({ adafruitio })
      this.props.update(adafruitio)
    }.bind(this)
  }

  handleUpdateEnable (ev) {
    const adafruitio = {
      ...this.state.adafruitio,
      enable: ev.target.checked
    }
    this.setState({ adafruitio })
    this.props.update(adafruitio)
  }

  toRow (label, text) {
    if (!this.state.adafruitio.enable) {
      return
    }
    return (
      <FormField key={'telemetry-' + label} label={text}>
        <Input
          type='text'
          value={this.state.adafruitio[label]}
          onChange={this.onChange(label)}
          id={'telemetry-' + label}
        />
      </FormField>
    )
  }

  render () {
    return (
      <>
        <div style={{ marginBottom: 'var(--reefpi-space-sm)' }} key='telemetry-enable'>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-xs)' }}>
            <input
              type='checkbox'
              defaultChecked={this.state.adafruitio.enable}
              onClick={this.handleUpdateEnable}
            />
            <b>Adafruit.IO</b>
          </label>
        </div>
        {this.toRow('user', 'Username')}
        {this.toRow('token', 'AIO Key')}
        {this.toRow('prefix', 'Prefix')}
      </>
    )
  }
}
