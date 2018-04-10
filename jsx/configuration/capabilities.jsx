import React from 'react'

export default class Capabilities extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: this.props.capabilities
    }
    this.updateCapability = this.updateCapability.bind(this)
    this.toLi = this.toLi.bind(this)
  }

  updateCapability (cap) {
    return function (ev) {
      var capabilities = this.state.capabilities
      capabilities[cap] = ev.target.checked
      this.setState({ capabilities: capabilities })
      this.props.update(this.state.capabilities)
    }.bind(this)
  }

  toLi (label) {
    return (
      <div className='form-check'>
        <label className='form-check-label'>
          <input
            className='form-check-input'
            type='checkbox'
            id={'update-' + label}
            onClick={this.updateCapability(label)}
            defaultChecked={this.state.capabilities[label]}
            />
          {label}
        </label>
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        {this.toLi('equipments')}
        {this.toLi('timers')}
        {this.toLi('lighting')}
        {this.toLi('ato')}
        {this.toLi('temperature')}
        {this.toLi('camera')}
        {this.toLi('doser')}
        {this.toLi('ph')}
        {this.toLi('health_check')}
        {this.toLi('dashboard')}
        {this.toLi('dev_mode')}
      </div>
    )
  }
}
