import React from 'react'
import $ from 'jquery'
import Common from './common.jsx'

export default class Timer extends Common {
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
    $.ajax({
      url: '/api/equipments/' + id,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          equipment: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/timers/' + this.props.timer_id,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          timer: data
        })
        this.fetchEquipment(data.equipment)
      }.bind(this),
      error: function (xhr, status, err) {
       //TODO common integration
      }
    })
  }

  update () {
  }

  t2s() {
   if(this.state.timer == undefined){
     return ''
   }
   var eqAction = this.state.timer.on ? 'on' : 'off'
   var eqName = this.state.equipment === undefined ? '' : this.state.equipment.name
   var parts = [ 
     this.state.timer.day,
     this.state.timer.hour,
     this.state.timer.minute,
     this.state.timer.second,
     '('+eqName + ' ' + eqAction+')'
    ]
   return parts.join(' ')
  }

  componentDidMount () {
    this.fetchData()
  }

  render () {
    return (
      <div className='container'>
        <div className='col-sm-2'>
          <label>{this.props.name}</label>
        </div>
        <div className='col-sm-2 small'>{this.t2s()}</div>
      </div>
    )
  }
}
