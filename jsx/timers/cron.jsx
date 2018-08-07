import React from 'react'
import PropTypes from 'prop-types'

export default class Cron extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      day: props.day,
      hour: props.hour,
      minute: props.minute,
      second: props.second
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
      this.props.update(payload)
    }.bind(this))
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <label className='col'>Day of month</label>
          <input
            type='text'
            id={this.props.id_prefix + '-day'}
            disabled={this.props.disabled}
            className='col'
            value={this.state.day}
            onChange={this.update('day')}
          />
        </div>
        <div className='row'>
          <label className='col'>Hour</label>
          <input
            type='text'
            id={this.props.id_prefix + '-hour'}
            className='col'
            value={this.state.hour}
            onChange={this.update('hour')}
            disabled={this.props.disabled}
          />
        </div>
        <div className='row'>
          <label className='col'>Minute</label>
          <input
            type='text'
            id={this.props.id_prefix + '-minute'}
            className='col'
            value={this.state.minute}
            onChange={this.update('minute')}
            disabled={this.props.disabled}
          />
        </div>
        <div className='row'>
          <label className='col'>Second</label>
          <input
            type='text'
            id={this.props.id_prefix + '-second'}
            className='col'
            value={this.state.second}
            onChange={this.update('second')}
            disabled={this.props.disabled}
          />
        </div>
      </div>
    )
  }
}

Cron.propTypes = {
  update: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  id_prefix: PropTypes.string.isRequired,
  day: PropTypes.string.isRequired,
  hour: PropTypes.string.isRequired,
  minute: PropTypes.string.isRequired,
  second: PropTypes.string.isRequired
}
