import React from 'react'

export default class AdafruitIO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      adafruitio: this.props.adafruitio
    }
    this.updateEnable = this.updateEnable.bind(this)
    this.toRow = this.toRow.bind(this)
  }

  updateEnable (ev) {
    var adafruitio = this.state.adafruitio
    adafruitio.enable = ev.target.checked
    this.setState({adafruitio: adafruitio})
    this.props.update(this.state.adafruitio)
  }

  toRow (label, text) {
    if (!this.state.adafruitio.enable) {
      return
    }
    var fn = function (ev) {
      var adafruitio = this.state.adafruitio
      adafruitio[label] = ev.target.value
      this.setState({adafruitio: adafruitio})
      this.props.update(this.state.adafruitio)
    }.bind(this)
    return (
      <div className='row'>
        <div className='col-sm-2'>
          {text}
        </div>
        <div className='col-sm-2'>
          <input type='text' value={this.state.adafruitio[label]} onChange={fn} id={'telemetry-' + label} />
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='form-check'>
            <label className='form-check-label'>
              <input className='form-check-input'
                type='checkbox'
                defaultChecked={this.state.adafruitio.enable}
                onClick={this.updateEnable}
              />
              <b>Adafruit.IO</b>
            </label>
          </div>
        </div>
        {this.toRow('user', 'Username')}
        {this.toRow('token', 'AIO Key')}
        {this.toRow('prefix', 'Prefix')}
      </div>
    )
  }
}
