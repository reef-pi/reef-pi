import React from 'react'
import NotificationSettings from './notification'
import AdafruitIO from './adafruit_io'
import Mqtt from './mqtt'
import { showError } from 'utils/alert'
import { updateTelemetry, fetchTelemetry, sendTestMessage } from 'redux/actions/telemetry'
import { connect } from 'react-redux'
import i18n from '../utils/i18n'

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
      const conf = this.state.config
      conf[k] = e.target.value
      this.setState({ config: conf })
    }
  }

  handleTestMessage () {
    this.props.sendTestMessage()
  }

  static getDerivedStateFromProps (props, state) {
    if (props.config === undefined) {
      return null
    }
    state.config = props.config
    return state
  }

  handleEnableMailer (ev) {
    const c = this.state.config
    c.notify = ev.target.checked
    this.setState({
      config: c,
      updated: true
    })
  }

  handleSave () {
    const c = this.state.config
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
      if (c.mailer.password === '') {
        showError('Please set a valid mail password')
        error = true
      }
      if (c.mailer.To === '') {
        showError('Please set a valid mail recepient (To)')
        error = true
      }
      if (c.mailer.From === '') {
        showError('Please set a valid mail sender (From)')
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
    this.setState({ updated: false, config: c })
  }

  updateMailer (mailer) {
    const c = this.state.config
    c.mailer = mailer
    this.setState({
      config: c,
      updated: true
    })
  }

  componentDidMount () {
    this.props.fetch()
  }

  updateAio (adafruitio) {
    const c = this.state.config
    c.adafruitio = adafruitio
    this.setState({
      config: c,
      updated: true
    })
  }

  updateMqtt (m) {
    const c = this.state.config
    c.mqtt = m
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
      <div className='row'>
        <div className='col-12 col-md-6'>
          <NotificationSettings mailer={this.state.config.mailer} update={this.updateMailer} />
        </div>
        <div className='col-12 col-md-6'>
          <div className='row'>
            <div className='form-group col-12'>
              <label htmlFor='limit-per-hour'>{i18n.t('telemetry:main:limit-per-hour')}</label>
              <input
                id='limit-per-hour'
                type='text'
                value={this.state.config.throttle}
                onChange={this.handleUpdateThrottle}
                className='form-control'
              />
            </div>
          </div>
          <div className='row'>
            <div className='col'>
              <div className='float-right'>
                <input
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={this.handleTestMessage}
                  id='send-test-email'
                  value={i18n.t('telemetry:main:send-test-message')}
                />
              </div>
            </div>
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
    const c = this.state.config
    c.throttle = ev.target.value
    this.setState({
      config: c,
      updated: true
    })
  }

  render () {
    let updateButtonClass = 'btn btn-outline-success col-xs-12 col-md-3 offset-md-9'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-xs-12 col-md-3 offset-md-9'
    }
    return (
      <div className='container'>
        <div className='row'>{this.showAdafruitIO()}</div>
        <div className='row'>{this.showMqtt()}</div>
        <div className='row'>
          <div className='col-12'>
            <div className='form-group'>
              <label className='form-check-label'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='enable-mailer'
                  onClick={this.handleEnableMailer}
                  defaultChecked={this.state.config.notify}
                />
                <b>{i18n.t('telemetry:main:email-alerts')}</b>
              </label>
            </div>
          </div>
          {this.notification()}
        </div>
        <div className='row'>
          <div className='col'>
            <label>{i18n.t('telemetry:main:current-limit')}</label>
            <input
              type='text'
              onChange={this.updateLimit('current_limit')}
              id='updateCurrentLimit'
              defaultValue={this.state.config.current_limit}
            />
          </div>
          <div className='col'>
            <label>{i18n.t('telemetry:main:historical-limit')}</label>
            <input
              type='text'
              onChange={this.updateLimit('historical_limit')}
              id='updatetLimit'
              defaultValue={this.state.config.historical_limit}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <input
              type='button'
              className={updateButtonClass}
              onClick={this.handleSave}
              id='updateTelemetry'
              value={i18n.t('update')}
            />
          </div>
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
export default Telemetry
