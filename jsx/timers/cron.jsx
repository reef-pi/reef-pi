import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

export default class Cron extends React.Component {
  constructor (props) {
    super(props)
    var details = props.details
    if(details === undefined) {
      details = {
        day: '*',
        hour: '*',
        minute: '*',
        second: '0'
      }
    }
    this.state = {
      day: details.day,
      hour: details.hour,
      minute: details.minute,
      second: details.second
    }
    this.update = this.update.bind(this)
  }

  update(k) {
    return(function(ev){
      var payload = {
        day: this.state.day,
        hour: this.state.hour,
        minute: this.state.minute,
        second: this.state.second
      }
      payload[k] = ev.target.value
      this.setState(payload)
      if(this.props.updateHook !== undefined) {
        this.props.updateHook(payload)
      }
    }.bind(this))
  }

  render() {
    var tooltip = (<Tooltip id='day-tooltip'> Any integer between 1 to 31, representing the day of the month or other valid specification</Tooltip>)
    var instance = <OverlayTrigger overlay={tooltip}>
      <label> ? </label>
    </OverlayTrigger>
    return(
      <div className='container'>
        <div className='row'>
          <label className='col-sm-3'>Day of month</label>
          <input type='text' id='day' className='col-sm-2' value={this.state.day} onChange={this.update('day')}/>
          <label className='col-sm-1'>{instance}</label>
        </div>
        <div className='row'>
          <label className='col-sm-3'>Hour</label>
          <input type='text' id='hour' className='col-sm-2' value={this.state.hour} onChange={this.update('hour')}/>
        </div>
        <div className='row'>
          <label className='col-sm-3'>Minute</label>
          <input type='text' id='minute' className='col-sm-2' value={this.state.minute} onChange={this.update('minute')}/>
        </div>
        <div className='row'>
          <label className='col-sm-3'>Second</label>
          <input type='text' id='second' className='col-sm-2'  value={this.state.second} onChange={this.update('second')}/>
        </div>
      </div>
    )
  }
}
