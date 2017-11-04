import React from 'react'
import Telemetry from './telemetry.jsx'
import Auth from './auth.jsx'
import Common from './common.jsx'
import Capabilities from './capabilities.jsx'
import Display from './display.jsx'
import Notification from './notification.jsx'
import HealthNotify from './health_notify.jsx'

export default class Settings extends Common {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: [],
      settings: {},
      updated: false
    }
    this.loadCapabilities = this.loadCapabilities.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.updateName = this.updateName.bind(this)
    this.updateInterface = this.updateInterface.bind(this)
    this.updateCheckbox = this.updateCheckbox.bind(this)
    this.updateAddress = this.updateAddress.bind(this)
    this.updateTelemetry = this.updateTelemetry.bind(this)
    this.showTelemetry = this.showTelemetry.bind(this)
    this.showCapabilities = this.showCapabilities.bind(this)
    this.updateCapabilities = this.updateCapabilities.bind(this)
    this.update = this.update.bind(this)
    this.showDisplay = this.showDisplay.bind(this)
    this.toRow = this.toRow.bind(this)
    this.showNotification = this.showNotification.bind(this)
    this.updateHealthNotify = this.updateHealthNotify.bind(this)
    this.showHealthNotify = this.showHealthNotify.bind(this)
  }

  showHealthNotify () {
    if (this.state.settings.health_check === undefined) {
      return
    }
    return (
      <HealthNotify update={this.updateHealthNotify} state={this.state.settings.health_check} />
    )
  }

  updateHealthNotify (notify) {
    if (notify !== undefined) {
      var settings = this.state.settings
      settings.health_check = notify
      this.setState({settings: settings, updated: true})
    }
    return this.state
  }

  showNotification () {
    if (!this.state.settings.notification) {
      return
    }
    return (<Notification />)
  }

  updateCheckbox (key) {
    return (function (ev) {
      var settings = this.state.settings
      settings[key] = ev.target.checked
      this.setState({
        settings: settings,
        updated: true
      })
    }.bind(this))
  }

  showTelemetry () {
    if (this.state.settings.adafruitio === undefined) {
      return
    }
    return (
      <Telemetry adafruitio={this.state.settings.adafruitio} update={this.updateTelemetry} />
    )
  }

  showDisplay () {
    if (!this.state.settings.display) {
      return
    }
    return (<div className='container'><Display /></div>)
  }

  showCapabilities () {
    if (this.state.settings.capabilities === undefined) {
      return
    }
    return (
      <Capabilities capabilities={this.state.settings.capabilities} update={this.updateCapabilities} />
    )
  }

  loadCapabilities () {
    this.ajaxGet({
      url: '/api/capabilities',
      success: function (data) {
        this.setState({
          capabilities: data
        })
      }.bind(this)
    })
  }

  updateCapabilities (capabilities) {
    var settings = this.state.settings
    settings.capabilities = capabilities
    this.setState({
      settings: settings,
      updated: true
    })
  }

  updateTelemetry (adafruitio) {
    if (adafruitio.enable) {
      if (adafruitio.user === '') {
        this.setState({
          showAlert: true,
          alertMsg: 'Please set a valid adafruit.io user'
        })
        return
      }
      if (adafruitio.token === '') {
        this.setState({
          showAlert: true,
          alertMsg: 'Please set a valid adafruit.io key'
        })
        return
      }
    }
    var settings = this.state.settings
    settings.adafruitio = adafruitio
    this.setState({
      settings: settings,
      updated: true
    })
  }

  update () {
    this.ajaxPost({
      url: '/api/settings',
      data: JSON.stringify(this.state.settings),
      success: function (data) {
        this.setState({
          updated: false
        })
      }.bind(this)
    })
  }

  componentDidMount () {
    this.loadCapabilities()
    this.fetchData()
  }

  updateInterface (ev) {
    var settings = this.state.settings
    settings.interface = ev.target.value
    this.setState({
      settings: settings,
      updated: true
    })
  }

  updateAddress (ev) {
    var settings = this.state.settings
    settings.address = ev.target.value
    this.setState({
      settings: settings,
      updated: true
    })
  }

  fetchData () {
    this.ajaxGet({
      url: '/api/settings',
      success: function (data) {
        this.setState({
          settings: data
        })
      }.bind(this)
    })
  }

  updateName (ev) {
    var settings = this.state.settings
    settings.name = ev.target.value
    this.setState({
      settings: settings,
      updated: true
    })
  }

  toRow (label, hook) {
    return (
      <div className='input-group'>
        <label className='input-group-addon'> {label}</label>
        <input id={'to-row-' + label} value={this.state.settings[label]} type='text' onChange={hook} className='form-control' />
      </div>
    )
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }

    return (
      <div className='container'>
        {super.render()}
        <div className='row'>
          <div className='col-sm-6'>
            {this.toRow('name', this.updateName)}
            {this.toRow('interface', this.updateInterface)}
            {this.toRow('address', this.updateAddresse)}
            <div className='input-group'>
              <label className='input-group-addon'>Notification</label>
              <input type='checkbox' id='updateNotification' onClick={this.updateCheckbox('notification')} defaultChecked={this.state.settings.notification} className='form-control' />
              {this.showNotification()}
            </div>
            <div className='input-group'>
              <label className='input-group-addon'>Display</label>
              <input type='checkbox' id='updateDisplay' onClick={this.updateCheckbox('display')} defaultChecked={this.state.settings.display} className='form-control' />
              {this.showDisplay()}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='container' >
            <label> <b>Capabilities</b> </label>
            {this.showCapabilities()}
          </div>
        </div>
        <div className='row'>
          <div className='container' >
            <label> <b>AdafruitIO</b> </label>
            {this.showTelemetry()}
          </div>
          <div className='col-sm-4'>
            <label> <b>Health Check Alert</b> </label>
            {this.showHealthNotify()}
          </div>
        </div>
        <div className='row'>
          <input type='button' className={updateButtonClass} onClick={this.update} id='systemUpdateSettings' value='update' />
        </div>
        <div className='row'>
          <Auth />
        </div>
      </div>
    )
  }
}
