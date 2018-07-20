import React from 'react'
import NotificationSettings from './notification'
import AdafruitIO from './adafruit_io'
import {showAlert} from 'utils/alert'
import {updateTelemetry, fetchTelemetry} from 'redux/actions/telemetry'
import {connect} from 'react-redux'

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
    this.props.updateTelemetry(c)
    this.setState({updated: false, config: c})
  }

  updateMailer (mailer) {
    if (mailer.server === '') {
      showAlert('Please set a valid mail server')
      return
    }
    if (mailer.password === '') {
      showAlert('Please set a valid mail passowrd')
      return
    }
    if (mailer.To === '') {
      showAlert('Please set a valid mail recepient (To)')
      return
    }
    if (mailer.From === '') {
      showAlert('Please set a valid mail sender (From)')
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
    this.props.fetchTelemetry()
  }

  updateAio (adafruitio) {
    if (adafruitio.enable) {
      if (adafruitio.user === '') {
        showAlert('Please set a valid adafruit.io user')
        return
      }
      if (adafruitio.token === '') {
        showAlert('Please set a valid adafruit.io key')
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
        <div className='col-sm-4'>
          <NotificationSettings mailer={this.state.config.mailer} update={this.updateMailer} />
        </div>
        <div className='col-sm-2'>
          limit per hour
        </div>
        <div className='col-sm-2'>
          <input type='text' value={this.state.config.throttle} onChange={this.updateThrottle} id='' />
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
    return (
      <AdafruitIO adafruitio={this.state.config.adafruitio} update={this.updateAio} />
    )
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
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return (
      <div className='container'>
        <div className='row'>
          {this.showAdafruitIO()}
        </div>
        <div className='row'>
          <div className='form-check'>
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
          {this.notification()}
        </div>
        <div className='row'>
          <input type='button' className={updateButtonClass} onClick={this.save} id='updateTelemetry' value='update' />
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    config: state.telemetry
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTelemetry: () => dispatch(fetchTelemetry()),
    updateTelemetry: (s) => dispatch(updateTelemetry(s))
  }
}

const Telemetry = connect(mapStateToProps, mapDispatchToProps)(telemetry)
export default Telemetry
