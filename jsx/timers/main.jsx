import React from 'react'
import $ from 'jquery'
import Reminder from './reminder.jsx'
import Timer from './timer.jsx'
import Cron from './cron.jsx'
import Equipment from './equipment.jsx'
import {showAlert} from '../utils/alert'
import {confirm} from '../utils/confirm'
import {fetchTimers, createTimer, deleteTimer} from '../redux/actions/timer'
import {fetchEquipments} from '../redux/actions/equipment'
import {connect} from 'react-redux'

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addTimer: false,
      type: 'equipment',
      equipment: undefined,
      reminder: undefined
    }
    this.timerList = this.timerList.bind(this)
    this.createTimer = this.createTimer.bind(this)
    this.removeTimer = this.removeTimer.bind(this)
    this.toggleAddTimerDiv = this.toggleAddTimerDiv.bind(this)
    this.setType = this.setType.bind(this)
    this.update = this.update.bind(this)
    this.trigger = this.trigger.bind(this)
    this.pickEquipment = this.pickEquipment.bind(this)
    this.newTimer = this.newTimer.bind(this)
  }

  trigger () {
    switch (this.state.type) {
      case 'equipment':
        return (<Equipment updateHook={this.update('equipment')} equipments={this.props.equipments} />)
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
    this.props.fetchEquipments()
    this.props.fetchTimers()
  }

  pickEquipment (id) {
    if (this.props.equipments === undefined) {
      return ({})
    }
    return this.props.equipments.find((el) => { return el.id === id })
  }

  timerList () {
    var list = []
    $.each(this.props.timers, function (i, timer) {
      list.push(
        <li key={timer.name} className='list-group-item'>
          <div className='row'>
            <div className='col-lg-10 col-xs-10'>
              <Timer config={timer} equipment={this.pickEquipment(timer.equipment.id)} />
            </div>
            <div className='col-lg-2 col-xs-2'>
              <input type='button' onClick={this.removeTimer(timer.id)} id={'timer-' + timer.name} value='delete' className='btn btn-outline-danger' />
            </div>
          </div>
        </li>
      )
    }.bind(this))
    return (list)
  }

  removeTimer (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.deleteTimer(id)
        }.bind(this))
    }.bind(this))
  }

  createTimer () {
    if ($('#name').val() === '') {
      showAlert('Specify timer name')
      return
    }
    if ($('#day').val() === '') {
      showAlert('Specify a value for "day"')
      return
    }
    if ($('#hour').val() === '') {
      showAlert('Specify a value for "hour"')
      return
    }
    if ($('#minute').val() === '') {
      showAlert('Specify a value for "minute"')
      return
    }
    if ($('#second').val() === '') {
      showAlert('Specify a value for "second"')
      return
    }
    switch (this.state.type) {
      case 'equipment':
        if (this.state.equipment === undefined) {
          showAlert('Select an equipment')
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
    this.props.createTimer(payload)
    this.toggleAddTimerDiv()
  }

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

  newTimer () {
    return (
      <div className='container'>
        <div className='row'>
          <label className='col-sm-1 text-secondary'>Name</label>
          <input type='text' id='name' className='col-sm-3' />
        </div>
        <div className='row'>
          <div className='col'>
            <Cron />
          </div>
          <div className='col'>
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
        </div>
        <div className='row'>
          <div className='col'>
            <input id='createTimer' type='button' value='add' onClick={this.createTimer} className='btn btn-outline-primary float-right' />
          </div>
        </div>
      </div>
    )
  }

  render () {
    var nT = <div />
    if (this.state.addTimer) {
      nT = this.newTimer()
    }
    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>{this.timerList()}</ul>
        <div className='container'>
          <input type='button' id='add_timer' value={this.state.addTimer ? '-' : '+'} onClick={this.toggleAddTimerDiv} className='btn btn-outline-success' />
          {nT}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    timers: state.timers,
    equipments: state.equipments
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTimers: () => dispatch(fetchTimers()),
    fetchEquipments: () => dispatch(fetchEquipments()),
    createTimer: (t) => dispatch(createTimer(t)),
    deleteTimer: (id) => dispatch(deleteTimer(id))
  }
}

const Timers = connect(mapStateToProps, mapDispatchToProps)(Main)
export default Timers
