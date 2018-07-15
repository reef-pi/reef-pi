import React from 'react'

export default class Cron extends React.Component {
  constructor (props) {
    super(props)
    var details = props.details
    if (details === undefined) {
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

  update (k) {
    return (function (ev) {
      var payload = {
        day: this.state.day,
        hour: this.state.hour,
        minute: this.state.minute,
        second: this.state.second
      }
      payload[k] = ev.target.value
      this.setState(payload)
      if (this.props.updateHook !== undefined) {
        this.props.updateHook(payload)
      }
    }.bind(this))
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <label className='col'>Day of month</label>
          <input type='text' id='day' className='col' value={this.state.day} onChange={this.update('day')} />
        </div>
        <div className='row'>
          <label className='col'>Hour</label>
          <input type='text' id='hour' className='col' value={this.state.hour} onChange={this.update('hour')} />
        </div>
        <div className='row'>
          <label className='col'>Minute</label>
          <input type='text' id='minute' className='col' value={this.state.minute} onChange={this.update('minute')} />
        </div>
        <div className='row'>
          <label className='col'>Second</label>
          <input type='text' id='second' className='col' value={this.state.second} onChange={this.update('second')} />
        </div>
      </div>
    )
  }
}
