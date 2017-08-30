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
  }

  updateSensor (ev) {
    var sensor = parseInt(ev.target.value)
    var ato = this.state.ato
    ato.sensor = sensor
    this.setState({
      ato: ato
    })
  }
  updatePump (ev) {
    var pump = parseInt(ev.target.value)
    var ato = this.state.ato
    ato.pump = pump
    this.setState({
      ato: ato
    })
  }
  updateCheckInterval (ev) {
    var checkInterval = parseInt(ev.target.value)
    var ato = this.state.ato
    ato.check_interval = checkInterval
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
    $.ajax({
      url: '/api/ato',
      type: 'POST',
      data: JSON.stringify(this.state.ato),
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

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>Check Interval (in seconds)</div>
          <input type='text' onChange={this.updateCheckInterval} id='check_interval' className='col-sm-1' value={this.state.ato.check_interval} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Monitor</div>
          <input type='checkbox' id='ato_enable' className='col-sm-2' defaultChecked={this.state.ato.enable} onChange={this.updateEnable} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Sensor Pin</div>
          <input type='text' id='sensor_pin' onChange={this.updateSensor} className='col-sm-2' value={this.state.ato.sensor} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Control</div>
          <input type='checkbox' id='ato_control' className='col-sm-2' value={this.state.ato.control} onChange={this.updateControl} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>ATO Pump pin</div>
          <input type='text' id='pump_pin' className='col-sm-2' value={this.state.ato.pump} onChange={this.updatePump} />
        </div>
        <div className='row'>
          <input type='button' id='updateATO' onClick={this.update} value='update' className='btn btn-outline-primary' />
        </div>
      </div>
    )
  }
}
