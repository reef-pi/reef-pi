import React from 'react'
import $ from 'jquery'
import Outlets from './outlets.jsx'
import Jacks from './jacks.jsx'

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
    this.updateLighting = this.updateLighting.bind(this)
    this.update = this.update.bind(this)
    this.jacksDiv = this.jacksDiv.bind(this)
    this.outletsDiv = this.outletsDiv.bind(this)
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

  updateLighting (ev) {
    var settings = this.state.settings
    settings.lighting = ev.target.checked
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

  jacksDiv () {
    var displayJack = false
    $.each(this.state.capabilities, function (i, c) {
      if (c === 'lighting') {
        displayJack = true
      }
    })
    if (displayJack) {
      return (<Jacks />)
    }
  }

  outletsDiv () {
    var displayOutlet = false
    $.each(this.state.capabilities, function (i, c) {
      if (c === 'equipments') {
        displayOutlet = true
      }
    })
    if (displayOutlet) {
      return (<Outlets />)
    }
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          {this.outletsDiv()}
        </div>
        <div className='row'>
          {this.jacksDiv()}
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
        <div className='row'>
          <div className='input-group'>
            <span className='input-group-addon'>Equipments</span>
            <input type='checkbox' id='updateEquipments' onChange={this.updateEquipments} className='form-control' defaultChecked={this.state.settings.equipments} />
          </div>
          <div className='input-group'>
            <span className='input-group-addon'>Timers</span>
            <input type='checkbox' id='updateTimers' onChange={this.updateTimers} className='form-control' defaultChecked={this.state.settings.timers} />
          </div>
          <div className='input-group'>
            <span className='input-group-addon'>Lighting</span>
            <input type='checkbox' id='updateLighting' onChange={this.updateLighting} className='form-control' defaultChecked={this.state.settings.lighting} />
          </div>
        </div>
        <div className='row'>
          <input type='button' className='btn btn-outline-success' onClick={this.update} id='systemUpdateSettings' value='update' />
        </div>
      </div>
    )
  }
}
