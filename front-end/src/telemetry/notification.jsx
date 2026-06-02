import React from 'react'
import i18n from '../utils/i18n'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

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
      const config = {
        ...this.state.config,
        [key]: ev.target.value
      }
      this.setState({
        config
      })
      this.props.update(config)
    }.bind(this)
  }

  updateTo () {
    return function (ev) {
      const recipients = ev.target.value.split(',')
      const config = {
        ...this.state.config,
        to: recipients.map(s => s.trim())
      }
      this.setState({
        config
      })
      this.props.update(config)
    }.bind(this)
  }

  inputTo () {
    return (
      <FormField label={i18n.t('telemetry:notification:to')}>
        <Input
          type='text'
          id='input-to'
          value={this.state.config.to.join()}
          onChange={this.updateTo()}
        />
      </FormField>
    )
  }

  inputGroup (key) {
    return (
      <FormField label={i18n.t('telemetry:notification:' + key)}>
        <Input
          type='text'
          id={'input-' + key}
          value={this.state.config[key]}
          onChange={this.update(key)}
        />
      </FormField>
    )
  }

  render () {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
        {this.inputGroup('server')}
        {this.inputGroup('port')}
        {this.inputGroup('from')}
        {this.inputTo('to')}
        <FormField label={i18n.t('telemetry:notification:username') + ' (' + i18n.t('optional') + ')'}>
          <Input
            type='text'
            id='input-username'
            value={this.state.config.username}
            onChange={this.update('username')}
          />
        </FormField>
        <FormField label={i18n.t('telemetry:notification:password') + ' (' + i18n.t('optional') + ')'}>
          <Input
            type='password'
            id='email-password'
            value={this.state.config.password}
            onChange={this.update('password')}
          />
        </FormField>
      </div>
    )
  }
}
