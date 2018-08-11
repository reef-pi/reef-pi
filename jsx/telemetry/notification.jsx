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
      <div className='input-group row'>
        <label className='input-group-addon col'>{key}</label>
        <input type='text' id={'input-' + key} value={this.state.config[key]} onChange={this.update(key)} className='form-control col' />
      </div>
    )
  }

  render () {
    return (
      <div className='conta'>
        {this.inputGroup('server')}
        {this.inputGroup('port')}
        {this.inputGroup('from')}
        {this.inputGroup('to')}
        <div className='input-group row'>
          <label className='input-group-addon col'>Password</label>
          <input
            type='password'
            id='email-password'
            value={this.state.config.password}
            onChange={this.update('password')}
            className='col'
          />
        </div>
      </div>
    )
  }
}
