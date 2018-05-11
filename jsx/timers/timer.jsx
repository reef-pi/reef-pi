import React from 'react'
import {hideAlert} from '../utils/alert.js'
import {ajaxGet} from '../utils/ajax.js'

export default class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      timer: undefined,
      equipment: undefined
    }
    this.fetchData = this.fetchData.bind(this)
    this.update = this.update.bind(this)
    this.t2s = this.t2s.bind(this)
    this.fetchEquipment = this.fetchEquipment.bind(this)
  }

  fetchEquipment (id) {
    ajaxGet({
      url: '/api/equipments/' + id,
      success: function (data) {
        this.setState({
          equipment: data
        })
      }.bind(this)
    })
  }

  fetchData () {
    ajaxGet({
      url: '/api/timers/' + this.props.timer_id,
      success: function (data) {
        this.setState({
          timer: data
        })
        if (data.type === 'equipment') {
          this.fetchEquipment(data.equipment.id)
        }
        hideAlert()
      }.bind(this)
    })
  }

  update () {
  }

  t2s () {
    if (this.state.timer === undefined) {
      return ''
    }
    var trigger = ''
    switch (this.state.timer.type) {
      case 'equipment':
        var eqAction = this.state.timer.equipment.on ? 'on' : 'off'
        var eqName = this.state.equipment === undefined ? '' : this.state.equipment.name
        if (this.state.timer.equipment.revert) {
          trigger = '(' + eqName + ' ' + eqAction + ' [' + this.state.timer.equipment.duration + ']' + ')'
        } else {
          trigger = '(' + eqName + ' ' + eqAction + ')'
        }
        break
      case 'reminder':
        trigger = '(reminder)'
        break
    }

    var parts = [
      this.state.timer.day + '  ',
      this.state.timer.hour + ':',
      this.state.timer.minute + ':',
      this.state.timer.second + ' ',
      trigger
    ]
    return parts.join('')
  }

  componentDidMount () {
    this.fetchData()
  }

  render () {
    return (
      <div className='container'>
        <div className='col-sm-3'>
          <label className='text-primary'>{this.props.name}</label>
        </div>
        <div className='col-sm-9 pre'>{this.t2s()}</div>
      </div>
    )
  }
}
