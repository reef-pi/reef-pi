import Common from '../common.jsx'
import Cron from '../timers/cron.jsx'
import $ from 'jquery'
import React from 'react'

export default class Pump extends Common {
  constructor (props) {
    super(props)
    this.state = {
      calibrate: false,
      schedule: false,
      speed: 0,
      duration: 0
    }
    this.remove = this.remove.bind(this)
    this.calibrate = this.calibrate.bind(this)
    this.schedule = this.schedule.bind(this)
    this.calibrateUI = this.calibrateUI.bind(this)
    this.scheduleUI = this.scheduleUI.bind(this)
    this.onDemand = this.onDemand.bind(this)
    this.updateSpeed = this.updateSpeed.bind(this)
    this.setSchedule = this.setSchedule.bind(this)
    this.setDuration = this.setDuration.bind(this)
  }

  setDuration(ev) {
    this.setState({duration: ev.target.value})
  }

  setSchedule() {
  }

  updateSpeed(ev) {
    this.setState({speed: ev.target.value})
  }

  onDemand() {
    // TODO on demand API (speed and duration against a pump
  }

  calibrateUI() {
    if(!this.state.calibrate){return}
    return(
      <div className='container'>
        <hr />
        <div className='col-sm-1'><label>Speed</label></div>
        <input className='col-sm-5' type='range' onChange={this.updateSpeed} value={this.state.speed}/>
        <input className='col-sm-1' type='text' value={this.state.speed} readOnly={true}/>
        <label className='col-sm-2'>Durartion</label>
        <input type='text' className='col-sm-1'/>
        <input type='button' value='Run' onClick={this.onDemand} className='btn btn-secondary'/>
      </div>
    )
  }

  scheduleUI() {
    if(!this.state.schedule){return}
    return(
      <div className='container'>
        <hr/>
        <Cron />
        <div className='row'>
          <label className='col-sm-3'> Duration </label>
          <input type='text' value={this.state.duration} onClick={this.setDuration} className='col-sm-2'/>
        </div>
        <div className='row'>
          <div className='col-sm-1'><label>Speed</label></div>
          <input className='col-sm-5' type='range' onChange={this.updateSpeed} value={this.state.speed}/>
          <input className='col-sm-1' type='text' value={this.state.speed} readOnly={true}/>
        </div>
        <input type='button' value='Set' onClick={this.setSchedule} className='btn btn-secondary'/>
      </div>
    )
  }


  calibrate() {
    this.setState({calibrate: !this.state.calibrate})
  }

  schedule() {
    this.setState({schedule: !this.state.schedule})
  }

  remove (id) {
    this.confirm('Are you sure ?')
    .then(function () {
      this.ajaxDelete({
        url: '/api/dosers/' + this.props.data.id,
        type: 'DELETE',
        success: function (data) {
          this.props.updateHook()
        }.bind(this)
      })
    }.bind(this))
  }


  render() {
    return(
     <div className='container'>
      <div className='row'>
        <div className='col-sm-6'>
          <label className='text-secondary'>{this.props.data.name}</label>
        </div>
        <div className='col-sm-2'>
          <input type='button' id={'schedule-pump-' + this.props.data.id} onClick={this.calibrate} value='calibrate' className='btn btn-outline-primary' />
        </div>
        <div className='col-sm-2'>
          <input type='button' id={'schedule-pump-' + this.props.data.id} onClick={this.schedule} value='schedule' className='btn btn-outline-primary' />
        </div>
        <div className='col-sm-2'>
          <input type='button' id={'remove-pump-' + this.props.data.id} onClick={this.remove} value='delete' className='btn btn-outline-danger' />
        </div>
      </div>
      <div className='row'>
        {this.calibrateUI()}
      </div>
      <div className='row'>
        {this.scheduleUI()}
      </div>
     </div>
    )
  }
}
