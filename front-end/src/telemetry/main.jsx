import React from 'react'
import NotificationSettings from './notification'
import AdafruitIO from './adafruit_io'
import Mqtt from './mqtt'
import { showError, showSuccess, showUpdateSuccessful } from 'utils/alert'
import { updateTelemetry, fetchTelemetry, sendTestMessage } from 'redux/actions/telemetry'
import { connect } from 'react-redux'
import i18n from '../utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const cloneTelemetryConfig = config => ({
  ...config,
  adafruitio: config.adafruitio ? { ...config.adafruitio } : config.adafruitio,
  mailer: config.mailer
    ? {
        ...config.mailer,
        to: Array.isArray(config.mailer.to) ? [...config.mailer.to] : config.mailer.to
      }
    : config.mailer,
  mqtt: config.mqtt ? { ...config.mqtt } : config.mqtt
})

class telemetry extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {
        historical_limit: 720,
        current_limit: 100,
        mailer: {
          to: []
        }
      },
      updated: false
    }
    this.showAdafruitIO = this.showAdafruitIO.bind(this)
    this.showMqtt = this.showMqtt.bind(this)
    this.notification = this.notification.bind(this)
    this.updateAio = this.updateAio.bind(this)
    this.updateMqtt = this.updateMqtt.bind(this)
    this.updateMailer = this.updateMailer.bind(this)
    this.handleEnableMailer = this.handleEnableMailer.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleUpdateThrottle = this.handleUpdateThrottle.bind(this)
    this.handleTestMessage = this.handleTestMessage.bind(this)
    this.updateLimit = this.updateLimit.bind(this)
  }

  updateLimit (k) {
    return (e) => {
      const conf = {
        ...this.state.config,
        [k]: e.target.value
      }
      this.setState({ config: conf })
    }
  }

  handleTestMessage () {
    this.props.sendTestMessage()
    showSuccess(i18n.t('telemetry:main:test-message-sent'))
  }

  static getDerivedStateFromProps (props, state) {
    if (props.config === undefined) {
      return null
    }
    if (state.updated) {
      return null
    }
    return { ...state, config: JSON.parse(JSON.stringify(props.config)) }
  }

  handleEnableMailer (ev) {
    const c = {
      ...this.state.config,
      notify: ev.target.checked
    }
    this.setState({
      config: c,
      updated: true
    })
  }

  handleSave () {
    const c = cloneTelemetryConfig(this.state.config)
    if (c.adafruitio.enable) {
      if (c.adafruitio.user === '') {
        showError('Please set a valid adafruit.io user')
        return
      }
      if (c.adafruitio.token === '') {
        showError('Please set a valid adafruit.io key')
        return
      }
    }
    if (c.notify) {
      let error = false
      if (c.mailer.server === '') {
        showError('Please set a valid mail server')
        error = true
      }
      if (!c.mailer.from || c.mailer.from === '') {
        showError('Please set a valid mail sender (From)')
        error = true
      }
      if (!c.mailer.to || c.mailer.to.length === 0) {
        showError('Please set a valid mail recipient (To)')
        error = true
      }
      if (error) {
        return
      }
      c.mailer.port = parseInt(c.mailer.port)
      c.throttle = parseInt(c.throttle)
    }
    c.current_limit = parseInt(c.current_limit)
    c.historical_limit = parseInt(c.historical_limit)
    this.props.update(c)
    showUpdateSuccessful()
    this.setState({ updated: false, config: c })
  }

  updateMailer (mailer) {
    const c = {
      ...this.state.config,
      mailer
    }
    this.setState({
      config: c,
      updated: true
    })
  }

  componentDidMount () {
    this.props.fetch()
  }

  updateAio (adafruitio) {
    const c = {
      ...this.state.config,
      adafruitio
    }
    this.setState({
      config: c,
      updated: true
    })
  }

  updateMqtt (m) {
    const c = {
      ...this.state.config,
      mqtt: m
    }
    this.setState({
      config: c,
      updated: true
    })
  }

  notification () {
    if (this.state.config === undefined) {
      return
    }
    if (this.state.config.mailer === undefined) {
      return
    }
    if (!this.state.config.notify) {
      return
    }
    return (
      <div className='telemetry-notification-row' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: 'var(--reefpi-space-md)', marginTop: 'var(--reefpi-space-sm)' }}>
        <NotificationSettings mailer={this.state.config.mailer} update={this.updateMailer} />
        <div>
          <FormField label={i18n.t('telemetry:main:limit-per-hour')}>
            <Input
              id='limit-per-hour'
              type='text'
              value={this.state.config.throttle}
              onChange={this.handleUpdateThrottle}
            />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--reefpi-space-sm)' }}>
            <Button
              variant='secondary'
              onClick={this.handleTestMessage}
              id='send-test-email'
            >{i18n.t('telemetry:main:send-test-message')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  showAdafruitIO () {
    if (this.state.config === undefined) {
      return
    }
    if (this.state.config.adafruitio === undefined) {
      return
    }
    return <AdafruitIO adafruitio={this.state.config.adafruitio} update={this.updateAio} />
  }

  showMqtt () {
    if (this.state.config === undefined) {
      return
    }
    if (this.state.config.mqtt === undefined) {
      return
    }
    return <Mqtt config={this.state.config.mqtt} update={this.updateMqtt} />
  }

  handleUpdateThrottle (ev) {
    const c = {
      ...this.state.config,
      throttle: ev.target.value
    }
    this.setState({
      config: c,
      updated: true
    })
  }

  render () {
    return (
      <div className='reefpi-view'>
        <div style={{ marginBottom: 'var(--reefpi-space-sm)' }}>{this.showAdafruitIO()}</div>
        <div style={{ marginBottom: 'var(--reefpi-space-sm)' }}>{this.showMqtt()}</div>
        <div style={{ marginBottom: 'var(--reefpi-space-sm)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-xs)' }}>
            <input
              type='checkbox'
              id='enable-mailer'
              onClick={this.handleEnableMailer}
              defaultChecked={this.state.config.notify}
            />
            <b>{i18n.t('telemetry:main:email-alerts')}</b>
          </label>
          {this.notification()}
        </div>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-md)', marginBottom: 'var(--reefpi-space-sm)' }}>
          <div>
            <label>{i18n.t('telemetry:main:current-limit')} </label>
            <input
              type='text'
              onChange={this.updateLimit('current_limit')}
              id='updateCurrentLimit'
              defaultValue={this.state.config.current_limit}
            />
          </div>
          <div>
            <label>{i18n.t('telemetry:main:historical-limit')} </label>
            <input
              type='text'
              onChange={this.updateLimit('historical_limit')}
              id='updatetLimit'
              defaultValue={this.state.config.historical_limit}
            />
          </div>
        </div>
        <div>
          <Button
            variant={this.state.updated ? 'danger' : 'primary'}
            onClick={this.handleSave}
            id='updateTelemetry'
          >{i18n.t('update')}
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    config: state.telemetry
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchTelemetry()),
    update: s => dispatch(updateTelemetry(s)),
    sendTestMessage: () => dispatch(sendTestMessage())
  }
}

const Telemetry = connect(
  mapStateToProps,
  mapDispatchToProps
)(telemetry)
export { telemetry as RawTelemetry }
export default Telemetry
