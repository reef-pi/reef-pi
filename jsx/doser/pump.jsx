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
      scheduleDetails: {},
      calibrationSpeed: 0,
      calibrationDuration: 0,
      scheduleDuration: 0,
      scheduleSpeed: 0,
      enable: false,
    }
    this.remove = this.remove.bind(this)
    this.calibrate = this.calibrate.bind(this)
    this.schedule = this.schedule.bind(this)
    this.calibrateUI = this.calibrateUI.bind(this)
    this.scheduleUI = this.scheduleUI.bind(this)
    this.onDemand = this.onDemand.bind(this)
    this.setSchedule = this.setSchedule.bind(this)
    this.update = this.update.bind(this)
    this.updateSchedule = this.updateSchedule.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
  }

  updateEnable(ev) {
    this.setState({enable: ev.target.checked})
  }

  updateSchedule(data) {
    this.setState({scheduleDetails: data})
  }

  update(k){
    return(function(ev){
      var h = {}
      h[k] = ev.target.value
      this.setState(h)
    }.bind(this))
  }


  setSchedule() {
    var payload  = {
      schedule: this.state.scheduleDetails,
      duration: this.state.scheduleDuration,
      speed: this.state.scheduleSpeed
    }
    this.ajaxPost({
      url: '/api/doser/pumps/' + this.props.data.id+'/schedule',
      data: JSON.stringify(payload),
      success: function (data) {
      }.bind(this)
    })
  }

  onDemand() {
    var payload = {
      speed: parseInt(this.state.calibrationSpeed),
      duration: parseInt(this.state.calibrationDuration)
    }
    this.ajaxPost({
      url: '/api/doser/pumps/' + this.props.data.id+'/calibrate',
      data: JSON.stringify(payload),
      success: function(data) {
      }.bind(this)
    })
  }

  calibrateUI() {
    if(!this.state.calibrate){return}
    return(
      <div className='container'>
        <hr />
        <div className='col-sm-1'><label>Speed</label></div>
        <input className='col-sm-5' type='range' onChange={this.update('calibrationSpeed')} value={this.state.calibrationSpeed}/>
        <input className='col-sm-1' type='text' value={this.state.calibrationSpeed} readOnly={true}/>
        <label className='col-sm-2'>Durartion</label>
        <input type='text' className='col-sm-1' onChange={this.update('calibrationDuration')}/>
        <input type='button' value='Run' onClick={this.onDemand} className='btn btn-secondary'/>
      </div>
    )
  }

  scheduleUI() {
    if(!this.state.schedule){return}
    return(
      <div className='container'>
        <hr/>
        <div className='row'>
          <label className='col-sm-3'>Enable</label>
          <input type='checkbox' value={this.state.enable} onChange={this.updateEnable} className='col-sm-2'/>
        </div>
        <Cron updateHook={this.updateSchedule}/>
        <div className='row'>
          <label className='col-sm-3'> Duration </label>
          <input type='text' value={this.state.scheduleDuration} onChange={this.update('scheduleDuration')} className='col-sm-2'/>
        </div>
        <div className='row'>
          <div className='col-sm-1'><label>Speed</label></div>
          <input className='col-sm-5' type='range' onChange={this.update('scheduleSpeed')} value={this.state.scheduleSpeed}/>
          <input className='col-sm-1' type='text' value={this.state.scheduleSpeed} readOnly={true}/>
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
        url: '/api/doser/pumps/' + this.props.data.id,
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
