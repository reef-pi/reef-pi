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
      <li className='list-inline-item'>
        <label className='btnt btn-secondary'>
          {label}
          <input
            className='btn btn-secondary'
            type='checkbox'
            id={'update-' + label}
            onClick={this.updateCapability(label)}
            defaultChecked={this.state.capabilities[label]}
            />
        </label>
      </li>
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
        {this.toLi('dev_mode')}
      </div>
    )
  }
}
