import React from 'react'
import $ from 'jquery'
import Outlets from './outlets.jsx'
import Jacks from './jacks.jsx'
import Telemetry from './telemetry.jsx'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: [],
      settings: {}
    }
    this.loadCapabilities = this.loadCapabilities.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.updateName = this.updateName.bind(this)
    this.updateInterface = this.updateInterface.bind(this)
    this.updateAddress = this.updateAddress.bind(this)
    this.updateEquipments = this.updateEquipments.bind(this)
    this.updateTimers = this.updateTimers.bind(this)
    this.updateDevMode = this.updateDevMode.bind(this)
    this.updateLighting = this.updateLighting.bind(this)
    this.updateATO = this.updateATO.bind(this)

    this.updateCamera = this.updateCamera.bind(this)
    this.updateTemperature = this.updateTemperature.bind(this)
    this.updateTelemetry = this.updateTelemetry.bind(this)
    this.showTelemetry = this.showTelemetry.bind(this)

    this.update = this.update.bind(this)
  }

  showTelemetry () {
    if (this.state.settings.adafruitio === undefined) {
      return
    }
    return (
      <Telemetry adafruitio={this.state.settings.adafruitio} update={this.updateTelemetry} />
    )
  }

  loadCapabilities () {
    $.ajax({
      url: '/api/capabilities',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          capabilities: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  updateTelemetry (adafruitio) {
    var settings = this.state.settings
    settings.adafruitio = adafruitio
    this.setState({
      settings: settings
    })
  }

  updateATO (ev) {
    var settings = this.state.settings
    settings.ato = ev.target.checked
    this.setState({
      settings: settings
    })
  }

  updateCamera (ev) {
    var settings = this.state.settings
    settings.camera = ev.target.checked
    this.setState({
      settings: settings
    })
  }

  updateTemperature (ev) {
    var settings = this.state.settings
    settings.temperature = ev.target.checked
    this.setState({
      settings: settings
    })
  }

  updateLighting (ev) {
    var settings = this.state.settings
    settings.lighting = ev.target.checked
    this.setState({
      settings: settings
    })
  }

  updateDevMode (ev) {
    var settings = this.state.settings
    settings.dev_mode = ev.target.checked
    this.setState({
      settings: settings
    })
  }

  updateTimers (ev) {
    var settings = this.state.settings
    settings.timers = ev.target.checked
    this.setState({
      settings: settings
    })
  }

  updateEquipments (ev) {
    var settings = this.state.settings
    settings.equipments = ev.target.checked
    this.setState({
      settings: settings
    })
  }

  update () {
    $.ajax({
      url: '/api/settings',
      type: 'POST',
      data: JSON.stringify(this.state.settings),
      success: function (data) {
      },
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
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
      settings: settings
    })
  }

  updateAddress (ev) {
    var settings = this.state.settings
    settings.address = ev.target.value
    this.setState({
      settings: settings
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/settings',
      type: 'GET',
      success: function (data) {
        this.setState({
          settings: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  updateName (ev) {
    var settings = this.state.settings
    settings.name = ev.target.value
    this.setState({
      settings: settings
    })
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <Outlets />
          <hr />
        </div>
        <div className='row'>
          <Jacks />
          <hr />
        </div>
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
        <hr />
        <div className='container'>
          <span > <b>Capabilities</b> </span>
          <div className='row'>
            <span className='col-sm-2'>Equipments</span>
            <input type='checkbox' id='updateEquipments' onClick={this.updateEquipments} className='col-sm-1' defaultChecked={this.state.settings.equipments} />
          </div>
          <div className='row'>
            <span className='col-sm-2'>Timers</span>
            <input type='checkbox' id='updateTimers' onClick={this.updateTimers} className='col-sm-1' defaultChecked={this.state.settings.timers} />
          </div>
          <div className='row'>
            <span className='col-sm-2'>Lighting</span>
            <input type='checkbox' id='updateLighting' onClick={this.updateLighting} className='col-sm-1' defaultChecked={this.state.settings.lighting} />
          </div>
          <div className='row'>
            <span className='col-sm-2'>ATO</span>
            <input type='checkbox' id='updateATO' onClick={this.updateATO} className='col-sm-1' defaultChecked={this.state.settings.ato} />
          </div>
          <div className='row'>
            <span className='col-sm-2'>Temperature</span>
            <input type='checkbox' id='updateTemperature' onClick={this.updateTemperature} className='col-sm-1' defaultChecked={this.state.settings.temperature} />
          </div>
          <div className='row'>
            <span className='col-sm-2'>Camera</span>
            <input className='col-sm-1' type='checkbox' id='updateCamera' onClick={this.updateCamera} defaultChecked={this.state.settings.camera} />
          </div>
          <div className='row'>
            <span className='col-sm-2'>DevMode</span>
            <input type='checkbox' id='updateDevMode' onClick={this.updateDevMode} className='col-sm-1' defaultChecked={this.state.settings.dev_mode} />
          </div>
        </div>
        <hr />
        <div className='row'>
          <div className='container' >
            <label> <b>Telemetry</b> </label>
            {this.showTelemetry()}
          </div>
        </div>
        <div className='row'>
          <input type='button' className='btn btn-outline-success' onClick={this.update} id='systemUpdateSettings' value='update' />
        </div>
      </div>
    )
  }
}
