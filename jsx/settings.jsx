import React from 'react'
import $ from 'jquery'
import Outlets from './outlets.jsx'
import Jacks from './jacks.jsx'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {
        equipments: {
          outlets: {}
        },
        system: {},
        api: {}
      }
    }
    this.fetchData = this.fetchData.bind(this)
    this.updateName = this.updateName.bind(this)
    this.updateInterface = this.updateInterface.bind(this)
    this.updateAddress = this.updateAddress.bind(this)
    this.update = this.update.bind(this)
  }

  update () {
    $.ajax({
      url: '/api/settings',
      type: 'POST',
      data: JSON.stringify(this.state.config),
      success: function (data) {
      },
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  updateInterface (ev) {
    var config = this.state.config
    config.system.interface = ev.target.value
    this.setState({
      config: config
    })
  }

  updateAddress (ev) {
    var config = this.state.config
    config.api.address = ev.target.value
    this.setState({
      config: config
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/settings',
      type: 'GET',
      success: function (data) {
        this.setState({
          config: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  updateName (ev) {
    var config = this.state.config
    config.system.name = ev.target.value
    this.setState({
      config: config
    })
  }

  render () {
    return (
      <div className='container img-rounded'>
        <div className='row'>
          <div className='col-sm-2'> Name</div>
          <div className='col-sm-2'><input id='system-name' value={this.state.config.system.name} type='text' onChange={this.updateName} className='form-control' /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'> Interface</div>
          <div className='col-sm-2'> <input type='text' value={this.state.config.system.interface} onChange={this.updateInterface} id='system-interface' className='form-control' /> </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Address</div>
          <div className='col-sm-3'><input type='text' value={this.state.config.api.address} id='system-api-address' onChange={this.updateAddress} className='form-control' /></div>
        </div>
        <div className='row'>
          <Outlets />
        </div>
        <div className='row'>
          <Jacks />
        </div>
        <div className='row'>
          <input type='button' className='btn btn-outline-success' onClick={this.update} id='system-update-settings' value='update' />
        </div>
      </div>
    )
  }
}
