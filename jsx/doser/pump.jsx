import Cron from '../timers/cron.jsx'
import $ from 'jquery'
import React from 'react'
import {showAlert} from '../utils/alert.js'
import {ajaxPost, ajaxDelete} from '../utils/ajax.js'
import {confirm} from '../utils/confirm.js'

export default class Pump extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      calibrate: false,
      schedule: false,
      scheduleDetails: props.data.regiment.schedule,
      calibrationSpeed: 50,
      calibrationDuration: 10,
      scheduleDuration: props.data.regiment.duration,
      scheduleSpeed: props.data.regiment.speed,
      enable: props.data.regiment.enable,
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
    this.setState({
      enable: ev.target.checked,
      updated: true
      })
  }

  updateSchedule(data) {
    this.setState({
      scheduleDetails: data,
      updated: true
      })
  }

  update(k){
    return(function(ev){
      var h = {}
      h[k] = ev.target.value
      h['updated'] = true
      this.setState(h)
    }.bind(this))
  }


  setSchedule() {
    var payload  = {
      schedule: this.state.scheduleDetails,
      duration: parseInt(this.state.scheduleDuration),
      speed: parseInt(this.state.scheduleSpeed),
      enable: this.state.enable
    }
    ajaxPost({
      url: '/api/doser/pumps/' + this.props.data.id+'/schedule',
      data: JSON.stringify(payload),
      success: function (data) {
       this.setState({updated: false})
      }.bind(this)
    })
  }

  onDemand() {
    var payload = {
      speed: parseInt(this.state.calibrationSpeed),
      duration: parseInt(this.state.calibrationDuration)
    }
    ajaxPost({
      url: '/api/doser/pumps/' + this.props.data.id+'/calibrate',
      data: JSON.stringify(payload),
      success: function(data) {
       this.setState({updated: false})
      }.bind(this)
    })
  }

  calibrateUI() {
    if(!this.state.calibrate){return}
    return(
      <div className='container'>
        <hr />
        <div className='col-sm-1'><label>Speed</label></div>
        <input
          className='col-sm-5'
          type='range'
          onChange={this.update('calibrationSpeed')}
          value={this.state.calibrationSpeed}
        />
        <input
          className='col-sm-1'
          type='text'
          value={this.state.calibrationSpeed}
          readOnly={true}
        />
        <label className='col-sm-2'>Durartion</label>
        <input
          type='text'
          className='col-sm-1'
          onChange={this.update('calibrationDuration')}
        />
        <input
          type='button'
          value='Run'
          onClick={this.onDemand}
          className='btn btn-secondary'
        />
      </div>
    )
  }

  scheduleUI() {
    if(!this.state.schedule){return}
    var setButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      setButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return(
      <div className='container'>
        <hr/>
        <div className='row'>
          <label className='col-sm-3'>Enable</label>
          <input
            id={'pump-enable-' + this.props.data.id}
            type='checkbox'
            value={this.state.enable}
            onChange={this.updateEnable}
            className='col-sm-2'
            defaultChecked={this.props.data.regiment.enable}
          />
        </div>
        <Cron
          details={this.state.scheduleDetails}
          updateHook={this.updateSchedule}
        />
        <div className='row'>
          <label className='col-sm-3'> Duration </label>
          <input type='text'
            id={'set-duration-'+this.props.data.id}
            value={this.state.scheduleDuration}
            onChange={this.update('scheduleDuration')}
            className='col-sm-2'
          />
        </div>
        <div className='row'>
          <div className='col-sm-1'><label>Speed</label></div>
          <input
            id={'set-speed-' + this.props.data.id}
            className='col-sm-5'
            type='range'
            onChange={this.update('scheduleSpeed')}
            value={this.state.scheduleSpeed}
          />V
          <input
            className='col-sm-1'
            type='text'
            value={this.state.scheduleSpeed}
            readOnly={true}
          />
        </div>
        <input
          type='button'
          id={'set-schedule-' + this.props.data.id}
          value='Set'
          onClick={this.setSchedule}
          className={setButtonClass}
        />
      </div>
    )
  }


  calibrate() {
    this.setState({
      calibrate: !this.state.calibrate
    })
  }

  schedule() {
    this.setState({
      schedule: !this.state.schedule
    })
  }

  remove (id) {
    confirm('Are you sure ?')
    .then(function () {
      ajaxDelete({
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
          <input
            type='button'
            id={'calibrate-pump-' + this.props.data.id}
            onClick={this.calibrate}
            value='calibrate'
            className='btn btn-outline-primary'
          />
        </div>
        <div className='col-sm-2'>
          <input
            type='button'
            id={'schedule-pump-' + this.props.data.id}
            onClick={this.schedule}
            value='schedule'
            className='btn btn-outline-primary'
          />
        </div>
        <div className='col-sm-2'>
          <input
            type='button'
            id={'remove-pump-' + this.props.data.id}
            onClick={this.remove}
            value='delete'
            className='btn btn-outline-danger'
          />
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
