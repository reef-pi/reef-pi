import React from 'react'

export default class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.t2s = this.t2s.bind(this)
  }

  t2s () {
    var trigger = ''
    switch (this.props.config.type) {
      case 'equipment':
        var eqAction = this.props.config.equipment.on ? 'on' : 'off'
        var eqName = this.props.equipment !== undefined ? this.props.equipment.name : ''
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
      <div className='row'>
        <label className='text-primary'>{this.props.config.name}</label>
        <div className='col-sm-6'><span className='small'>{this.t2s()}</span></div>
      </div>
    )
  }
}
