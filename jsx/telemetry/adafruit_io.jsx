import React from 'react'

export default class AdafruitIO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      adafruitio: this.props.adafruitio
    }
    this.updateEnable = this.updateEnable.bind(this)
    this.toRow = this.toRow.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onChange (label) {
    return function (ev) {
      var adafruitio = this.state.adafruitio
      adafruitio[label] = ev.target.value
      this.setState({ adafruitio: adafruitio })
      this.props.update(this.state.adafruitio)
    }.bind(this)
  }

  updateEnable (ev) {
    var adafruitio = this.state.adafruitio
    adafruitio.enable = ev.target.checked
    this.setState({ adafruitio: adafruitio })
    this.props.update(this.state.adafruitio)
  }

  toRow (label, text) {
    if (!this.state.adafruitio.enable) {
      return
    }
    return (
      <div className='form-group col-md-4 col-sm-12'>
        <label htmlFor={'telemetry-' + label}>{text}</label>
        <input
          type='text'
          value={this.state.adafruitio[label]}
          onChange={this.onChange(label)}
          id={'telemetry-' + label}
          className='form-control'
        />
      </div>
    )
  }

  render () {
    return [
      <div className=' col-12'>
        <div className='form-group'>
          <label className='form-check-label'>
            <input
              className='form-check-input'
              type='checkbox'
              defaultChecked={this.state.adafruitio.enable}
              onClick={this.updateEnable}
            />
            <b>Adafruit.IO</b>
          </label>
        </div>
      </div>,
      this.toRow('user', 'Username'),
      this.toRow('token', 'AIO Key'),
      this.toRow('prefix', 'Prefix')
    ]
  }
}
