import React from 'react'
import i18n from '../utils/i18n'

export default class NotificationSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      config: props.mailer
    }
    this.update = this.update.bind(this)
    this.inputGroup = this.inputGroup.bind(this)
    this.updateTo = this.updateTo.bind(this)
    this.inputTo = this.inputTo.bind(this)
  }

  update (key) {
    return function (ev) {
      const config = this.state.config
      config[key] = ev.target.value
      this.setState({
        config: config
      })
      this.props.update(config)
    }.bind(this)
  }

  updateTo () {
    return function (ev) {
      const config = this.state.config
      const recipients = ev.target.value.split(',')
      config.to = recipients.map(s => s.trim())
      this.setState({
        config: config
      })
      this.props.update(config)
    }.bind(this)
  }

  inputTo () {
    return (
      <div className='form-group col-12'>
        <label htmlFor='input-to'>{i18n.t('telemetry:notification:to')}</label>
        <input
          type='text'
          id='input-to'
          value={this.state.config.to.join()}
          onChange={this.updateTo()}
          className='form-control'
        />
      </div>
    )
  }

  inputGroup (key) {
    return (
      <div className='form-group col-12'>
        <label htmlFor={'input-' + key}>{i18n.t('telemetry:notification:' + key)}</label>
        <input
          type='text'
          id={'input-' + key}
          value={this.state.config[key]}
          onChange={this.update(key)}
          className='form-control'
        />
      </div>
    )
  }

  render () {
    return (
      <div className='row'>
        {this.inputGroup('server')}
        {this.inputGroup('port')}
        {this.inputGroup('from')}
        {this.inputTo('to')}
        <div className='form-group col-12'>
          <label htmlFor='input-username'>{i18n.t('telemetry:notification:username')} ({i18n.t('optional')})</label>
          <input
            type='text'
            id='input-username'
            value={this.state.config.username}
            onChange={this.update('username')}
            className='form-control'
          />
        </div>
        <div className='form-group col-12'>
          <label htmlFor='email-password'>{i18n.t('telemetry:notification:password')}</label>
          <input
            type='password'
            id='email-password'
            value={this.state.config.password}
            onChange={this.update('password')}
            className='form-control'
          />
        </div>
      </div>
    )
  }
}
