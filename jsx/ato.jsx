import React from 'react'
import $ from 'jquery'

export default class ATO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ato: {}
    }
    this.fetchData = this.fetchData.bind(this)
    this.update = this.update.bind(this)

    this.updateSensor = this.updateSensor.bind(this)
    this.updatePump = this.updatePump.bind(this)
    this.updateCheckInterval = this.updateCheckInterval.bind(this)
    this.updateControl = this.updateControl.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.showDetails = this.showDetails.bind(this)
  }

  updateSensor (ev) {
    var ato = this.state.ato
    ato.sensor = ev.target.value
    this.setState({
      ato: ato
    })
  }
  updatePump (ev) {
    var ato = this.state.ato
    ato.pump = ev.target.value
    this.setState({
      ato: ato
    })
  }
  updateCheckInterval (ev) {
    var ato = this.state.ato
    ato.check_interval = ev.target.value
    this.setState({
      ato: ato
    })
  }
  updateControl (ev) {
    var ato = this.state.ato
    ato.control = ev.target.checked
    this.setState({
      ato: ato
    })
  }
  updateEnable (ev) {
    var ato = this.state.ato
    ato.enable = ev.target.checked
    this.setState({
      ato: ato
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/ato',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          ato: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  update (ev) {
    var ato = this.state.ato
    ato.pump = parseInt(ato.pump)
    ato.sensor = parseInt(ato.sensor)
    ato.check_interval = parseInt(ato.check_interval)
    if (isNaN(ato.sensor)) {
      window.alert('Sensor pin has to be a positive integer')
      return
    }

    if (isNaN(ato.pump)) {
      window.alert('Pump pin has to be a positive integer')
      return
    }
    if (isNaN(ato.check_interval)) {
      window.alert('Check interval has to be a positive integer')
      return
    }
    $.ajax({
      url: '/api/ato',
      type: 'POST',
      data: JSON.stringify(ato),
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  showDetails () {
    if (!this.state.ato.enable) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>Check Interval (in seconds)</div>
          <input type='text' onChange={this.updateCheckInterval} id='check_interval' className='col-sm-1' value={this.state.ato.check_interval} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Sensor Pin</div>
          <input type='text' id='sensor_pin' onChange={this.updateSensor} className='col-sm-2' value={this.state.ato.sensor} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Control</div>
          <input type='checkbox' id='ato_control' className='col-sm-2' defaultChecked={this.state.ato.control} onClick={this.updateControl} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>ATO Pump pin</div>
          <input type='text' id='pump_pin' className='col-sm-2' value={this.state.ato.pump} onChange={this.updatePump} />
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Monitor</div>
          <input type='checkbox' id='ato_enable' className='col-sm-2' defaultChecked={this.state.ato.enable} onClick={this.updateEnable} />
        </div>
        {this.showDetails()}
        <div className='row'>
          <input type='button' id='updateATO' onClick={this.update} value='update' className='btn btn-outline-primary' />
        </div>
      </div>
    )
  }
}
