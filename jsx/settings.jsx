import React from 'react'
import Telemetry from './telemetry.jsx'
import Auth from './auth.jsx'
import Common from './common.jsx'
import Capabilities from './capabilities.jsx'
import Display from './display.jsx'

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
    return (
      <div className='container' >
        <label><b>Display</b></label>
        <Display />
      </div>
    )
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

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }

    return (
      <div className='container'>
        {super.render()}
        <div className='row'>
          <div className='col-sm-2'> Name</div>
          <div className='col-sm-2'><input id='system-name' value={this.state.settings.name} type='text' onChange={this.updateName} className='form-control' /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'> Interface</div>
          <div className='col-sm-2'> <input type='text' value={this.state.settings.interface} onChange={this.updateInterface} id='system-interface' className='form-control' /> </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Address</div>
          <div className='col-sm-3'><input type='text' value={this.state.settings.address} id='system-api-address' onChange={this.updateAddress} className='form-control' /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'> Display </div>
          <div className='col-sm-1'><input type='checkbox' id='updateDisplay' onClick={this.updateCheckbox('display')} defaultChecked={this.state.settings.display} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'> Heart Beat </div>
          <div className='col-sm-1'><input type='checkbox' id='updateHeartBeat' onClick={this.updateCheckbox('heart_beat')} defaultChecked={this.state.settings.heart_beat} /></div>
        </div>
        <hr />
        <div className='row'>
          <div className='container' >
            <label> <b>Capabilities</b> </label>
            {this.showCapabilities()}
          </div>
          <hr />
        </div>
        <div className='row'>
          <div className='container' >
            <label> <b>AdafruitIO</b> </label>
            {this.showTelemetry()}
          </div>
        </div>
        <div className='row'>
          {this.showDisplay()}
        </div>
        <hr />
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
