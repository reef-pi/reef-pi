import React from 'react'
import $ from 'jquery'
import Common from '../common.jsx'
import Reminder from './reminder.jsx'
import Timer from './timer.jsx'
import Cron from './cron.jsx'
import Equipment from './equipment.jsx'

export default class Timers extends Common {
  constructor (props) {
    super(props)
    this.state = {
      timers: [],
      addTimer: false,
      type: 'equipment',
      equipment: undefined,
      reminder: undefined
    }
    this.timerList = this.timerList.bind(this)
    this.createTimer = this.createTimer.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.removeTimer = this.removeTimer.bind(this)
    this.toggleAddTimerDiv = this.toggleAddTimerDiv.bind(this)
    this.setType = this.setType.bind(this)
    this.update = this.update.bind(this)
    this.trigger = this.trigger.bind(this)
  }

  trigger () {
    switch (this.state.type) {
      case 'equipment':
        return (<Equipment updateHook={this.update('equipment')} />)
      case 'reminder':
        return (<Reminder updateHook={this.update('reminder')} />)
    }
  }

  update (k) {
    return (function (d) {
      var h = {}
      h[k] = d
      this.setState(h)
    }.bind(this))
  }

  setType (t) {
    return (function () {
      this.setState({type: t})
    }.bind(this))
  }

  componentDidMount () {
    this.fetchData()
  }

  fetchData () {
    this.ajaxGet({
      url: '/api/timers',
      success: function (data) {
        this.setState({
          timers: data,
          showAlert: false
        })
      }.bind(this)
    })
  }

  timerList () {
    var list = []
    $.each(this.state.timers, function (i, timer) {
      list.push(
        <li key={timer.name} className='list-group-item row'>
          <div className='col-sm-10'>
            <Timer timer_id={timer.id} name={timer.name} equipment={timer.equipment} />
          </div>
          <div className='col-sm-2'>
            <input type='button' onClick={this.removeTimer(timer.id)} id={'timer-' + timer.name} value='delete' className='btn btn-outline-danger' />
          </div>
        </li>
        )
    }.bind(this))
    return (list)
  }

  removeTimer (id) {
    return (function () {
      this.confirm('Are you sure ?')
      .then(function () {
        this.ajaxDelete({
          url: '/api/timers/' + id,
          success: function (data) {
            this.fetchData()
          }.bind(this)
        })
      }.bind(this))
    }.bind(this))
  }

  createTimer () {
    if ($('#name').val() === '') {
      this.setState({
        alertMsg: 'Specify timer name',
        showAlert: true
      })
      return
    }
    if ($('#day').val() === '') {
      this.setState({
        alertMsg: 'Specify a value for "day"',
        showAlert: true
      })
      return
    }
    if ($('#hour').val() === '') {
      this.setState({
        alertMsg: 'Specify a value for "hour"',
        showAlert: true
      })
      return
    }
    if ($('#minute').val() === '') {
      this.setState({
        alertMsg: 'Specify a value for "minute"',
        showAlert: true
      })
      return
    }
    if ($('#second').val() === '') {
      this.setState({
        alertMsg: 'Specify a value for "second"',
        showAlert: true
      })
      return
    }
    switch (this.state.type) {
      case 'equipment':
        if (this.state.equipment === undefined) {
          this.setState({
            alertMsg: 'Select an equipment',
            showAlert: true
          })
          return
        }
        var eq = this.state.equipment
        eq.duration = parseInt(eq.duration)
        this.setState({equipment: eq})
        break
      case 'reminder':
        break
    }
    var payload = {
      name: $('#name').val(),
      day: $('#day').val(),
      hour: $('#hour').val(),
      minute: $('#minute').val(),
      second: $('#second').val(),
      equipment: this.state.equipment,
      type: this.state.type,
      reminder: this.state.reminder
    }
    this.ajaxPut({
      url: '/api/timers',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddTimerDiv()
      }.bind(this)
    })
  };

  toggleAddTimerDiv () {
    this.setState({
      addTimer: !this.state.addTimer
    })
    $('#name').val('')
    $('#day').val('')
    $('#hour').val('')
    $('#minute').val('')
    $('#second').val('')
  }

  render () {
    var dStyle = {
      display: this.state.addTimer ? 'block' : 'none'
    }
    return (
      <div className='container'>
        {this.showAlert()}
        <ul>{this.timerList()}</ul>
        <div className='container'>
          <input type='button' id='add_timer' value={this.state.addTimer ? '-' : '+'} onClick={this.toggleAddTimerDiv} className='btn btn-outline-success' />
          <div style={dStyle} className='container'>
            <div className='row'>
              <label className='col-sm-1 text-secondary'>Name</label>
              <input type='text' id='name' className='col-sm-3' />
            </div>
            <div className='row'>
              <div className='col-sm-6'>
                <div className='btn-group'>
                  <label className='btn btn-secondary'>
                    <input type='radio' name='options' id='reminder' onClick={this.setType('reminder')} /> Reminder
                  </label>
                  <label className='btn btn-secondary'>
                    <input type='radio' name='options' id='equipment' defaultChecked onClick={this.setType('equipment')} /> Equipment
                  </label>
                </div>
                {this.trigger()}
              </div>
              <div className='col-sm-6'>
                <Cron />
              </div>
            </div>
            <input id='createTimer' type='button' value='add' onClick={this.createTimer} className='btn btn-outline-primary' />
          </div>

        </div>
      </div>
    )
  }
}
