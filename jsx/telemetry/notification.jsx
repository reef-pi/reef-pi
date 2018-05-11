import React from 'react'

export default class NotificationSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      config: props.mailer
    }
    this.update = this.update.bind(this)
    this.inputGroup = this.inputGroup.bind(this)
  }

  update (key) {
    return (function (ev) {
      var config = this.state.config
      config[key] = ev.target.value
      this.setState({
        config: config
      })
      this.props.update(config)
    }.bind(this))
  }

  inputGroup (key) {
    return (
      <div className='input-group'>
        <label className='input-group-addon'>{key}</label>
        <input type='text' id={'input-' + key} value={this.state.config[key]} onChange={this.update(key)} className='form-control' />
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        <label><b>Email settings</b></label>
        {this.inputGroup('server')}
        {this.inputGroup('port')}
        {this.inputGroup('from')}
        {this.inputGroup('to')}
        <div className='input-group'>
          <label className='input-group-addon'>Password</label>
          <input type='password' id='password' value={this.state.config.password} onChange={this.update('password')} />
        </div>
      </div>
    )
  }
}
