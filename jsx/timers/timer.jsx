import React from 'react'
import {hideAlert} from '../utils/alert.js'
import {connect} from 'react-redux'
import {isEmptyObject} from 'jquery'

export default class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.t2s = this.t2s.bind(this)
  }

  t2s () {
    var trigger = ''
    switch (this.props.config.type) {
      case 'equipment':
        var eqAction =  this.props.config.equipment.on ? 'on' : 'off'
        var eqName =  this.props.equipment !== undefined ? this.props.equipment.name : ''
        if (this.props.config.equipment.revert) {
          trigger = '(' + eqName + ' ' + eqAction + ' [' + this.props.config.equipment.duration + ']' + ')'
        } else {
          trigger = '(' + eqName + ' ' + eqAction + ')'
        }
        break
      case 'reminder':
        trigger = '(reminder)'
        break
    }

    var parts = [
      this.props.config.day + '  ',
      this.props.config.hour + ':',
      this.props.config.minute + ':',
      this.props.config.second + ' ',
      trigger
    ]
    return parts.join('')
  }

  render () {
    return (
      <div className='container'>
        <div className='col-sm-3'>
          <label className='text-primary'>{this.props.config.name}</label>
        </div>
        <div className='col-sm-9 pre'>{this.t2s()}</div>
      </div>
    )
  }
}
