import React from 'react'

export default class Telemetry extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      adafruitio: this.props.adafruitio
    }
    this.updateEnable = this.updateEnable.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.updateToken = this.updateToken.bind(this)
    this.updatePrefix = this.updatePrefix.bind(this)
  }

  updateEnable (ev) {
    var adafruitio = this.state.adafruitio
    adafruitio.enable = ev.target.checked
    this.setState({adafruitio: adafruitio})
    this.props.update(this.state.adafruitio)
  }

  updateUser (ev) {
    var adafruitio = this.state.adafruitio
    adafruitio.user = ev.target.value
    this.setState({adafruitio: adafruitio})
    this.props.update(this.state.adafruitio)
  }

  updateToken (ev) {
    var adafruitio = this.state.adafruitio
    adafruitio.token = ev.target.value
    this.setState({dafruitio: adafruitio})
    this.props.update(this.state.adafruitio)
  }

  updatePrefix (ev) {
    var adafruitio = this.state.adafruitio
    adafruitio.prefix = ev.target.value
    this.setState({adafruitio: adafruitio})
    this.props.update(this.state.adafruitio)
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>
            Enable
          </div>
          <div className='col-sm-2'>
            <input type='checkbox' defaultChecked={this.state.adafruitio.enable} onClick={this.updateEnable} />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>
            Key
          </div>
          <div className='col-sm-2'>
            <input type='text' value={this.state.adafruitio.token} onChange={this.updateToken} id='telemetryToken' />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>
            User
          </div>
          <div className='col-sm-2'>
            <input type='text' value={this.state.adafruitio.user} onChange={this.updateUser} id='telemetryUser' />
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>
            Prefix
          </div>
          <div className='col-sm-2'>
            <input type='text' value={this.state.adafruitio.prefix} onChange={this.updatePrefix} id='telemetryPrefix' />
          </div>
        </div>
      </div>
    )
  }
}
