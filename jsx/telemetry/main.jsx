import React from 'react'
import NotificationSettings from './notification'
import AdafruitIO from './adafruit_io'
import { showError } from 'utils/alert'
import { updateTelemetry, fetchTelemetry, sendTestMessage } from 'redux/actions/telemetry'
import { connect } from 'react-redux'

class telemetry extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {},
      updated: false
    }
    this.showAdafruitIO = this.showAdafruitIO.bind(this)
    this.notification = this.notification.bind(this)
    this.updateAio = this.updateAio.bind(this)
    this.updateMailer = this.updateMailer.bind(this)
    this.enableMailer = this.enableMailer.bind(this)
    this.save = this.save.bind(this)
    this.updateThrottle = this.updateThrottle.bind(this)
    this.testMessage = this.testMessage.bind(this)
  }

  testMessage () {
    this.props.sendTestMessage()
  }

  static getDerivedStateFromProps (props, state) {
    if (props.config === undefined) {
      return null
    }
    state.config = props.config
    return state
  }

  enableMailer (ev) {
    var c = this.state.config
    c.notify = ev.target.checked
    this.setState({
      config: c,
      updated: true
    })
  }

  save () {
    var c = this.state.config
    c.mailer.port = parseInt(c.mailer.port)
    c.throttle = parseInt(c.throttle)
    this.props.update(c)
    this.setState({ updated: false, config: c })
  }

  updateMailer (mailer) {
    if (mailer.server === '') {
      showError('Please set a valid mail server')
      return
    }
    if (mailer.password === '') {
      showError('Please set a valid mail passowrd')
      return
    }
    if (mailer.To === '') {
      showError('Please set a valid mail recepient (To)')
      return
    }
    if (mailer.From === '') {
      showError('Please set a valid mail sender (From)')
      return
    }
    var c = this.state.config
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
    if (adafruitio.enable) {
      if (adafruitio.user === '') {
        showError('Please set a valid adafruit.io user')
        return
      }
      if (adafruitio.token === '') {
        showError('Please set a valid adafruit.io key')
        return
      }
    }
    var c = this.state.config
    c.adafruitio = adafruitio
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
              <label htmlFor='limit-per-hour'>limit per hour</label>
              <input
                id='limit-per-hour'
                type='text'
                value={this.state.config.throttle}
                onChange={this.updateThrottle}
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
                  onClick={this.testMessage}
                  id='send-test-email'
                  value='Send test message'
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

  updateThrottle (ev) {
    var c = this.state.config
    c.throttle = ev.target.value
    this.setState({
      config: c,
      updated: true
    })
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger'
    }
    return (
      <div className='container'>
        <div className='row'>{this.showAdafruitIO()}</div>
        <div className='row'>
          <div className=' col-12'>
            <div className='form-group'>
              <label className='form-check-label'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='enable-mailer'
                  onClick={this.enableMailer}
                  defaultChecked={this.state.config.notify}
                />
                <b>Email alerts</b>
              </label>
            </div>
          </div>
          {this.notification()}
        </div>
        <div className='row mt-3'>
          <div className='col'>
            <div className='float-right'>
              <input
                type='button'
                className={updateButtonClass}
                onClick={this.save}
                id='updateTelemetry'
                value='update'
              />
            </div>
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
