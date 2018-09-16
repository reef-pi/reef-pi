import React from 'react'
import Reminder from './reminder'
import Timer from './timer'
import Cron from './cron'
import Equipment from './equipment'
import { showAlert } from 'utils/alert'
import { confirm } from 'utils/confirm'
import { updateTimer, fetchTimers, createTimer, deleteTimer } from 'redux/actions/timer'
import { fetchEquipment } from 'redux/actions/equipment'
import { connect } from 'react-redux'

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addTimer: false,
      type: 'equipment',
      equipment: undefined,
      reminder: undefined,
      day: '*',
      minute: '*',
      hour: '*',
      second: '0',
      name: '',
      enable: true
    }
    this.timerList = this.timerList.bind(this)
    this.createTimer = this.createTimer.bind(this)
    this.removeTimer = this.removeTimer.bind(this)
    this.toggleAddTimerDiv = this.toggleAddTimerDiv.bind(this)
    this.setType = this.setType.bind(this)
    this.update = this.update.bind(this)
    this.trigger = this.trigger.bind(this)
    this.newTimer = this.newTimer.bind(this)
    this.updateCron = this.updateCron.bind(this)
  }

  updateCron (p) {
    this.setState({
      day: p.day,
      minute: p.minute,
      hour: p.hour,
      second: p.second
    })
  }

  trigger () {
    switch (this.state.type) {
      case 'equipment':
        return (
          <Equipment
            active_id=''
            revert={false}
            on={false}
            duration={2}
            equipment={this.props.equipment}
            disabled={false}
            id_prefix='new-timer'
            update={this.update('equipment')}
          />
        )
      case 'reminder':
        return <Reminder update={this.update('reminder')} disabled={false} id_prefix='new-timer' message='' title='' />
    }
  }

  update (k) {
    return function (d) {
      var h = {}
      h[k] = d
      this.setState(h)
    }.bind(this)
  }

  setType (t) {
    return function () {
      this.setState({ type: t })
    }.bind(this)
  }

  componentDidMount () {
    this.props.fetchEquipment()
    this.props.fetch()
  }

  timerList () {
    var list = []
    this.props.timers.forEach((timer, i) => {
      list.push(
        <li key={timer.name} className='list-group-item'>
          <Timer
            name={timer.name}
            timer_id={timer.id}
            type={timer.type}
            day={timer.day}
            hour={timer.hour}
            minute={timer.minute}
            second={timer.second}
            equipment={timer.equipment}
            reminder={timer.reminder}
            remove={this.removeTimer(timer.id)}
            update={p => {
              this.props.update(timer.id, p)
            }}
            enable={timer.enable}
            equipmentList={this.props.equipment}
          />
        </li>
      )
    })
    return list
  }

  removeTimer (id) {
    return function () {
      confirm('Are you sure ?').then(
        function () {
          this.props.delete(id)
        }.bind(this)
      )
    }.bind(this)
  }

  createTimer () {
    if (this.state.name === '') {
      showAlert('Specify timer name')
      return
    }
    if (this.state.day === '') {
      showAlert('Specify a value for "day"')
      return
    }
    if (this.state.hour === '') {
      showAlert('Specify a value for "hour"')
      return
    }
    if (this.state.minute === '') {
      showAlert('Specify a value for "minute"')
      return
    }
    if (this.state.second === '') {
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
        this.setState({ equipment: eq })
        break
      case 'reminder':
        break
    }
    var payload = {
      name: this.state.name,
      day: this.state.day,
      hour: this.state.hour,
      minute: this.state.minute,
      second: this.state.second,
      enable: this.state.enable,
      equipment: this.state.equipment,
      type: this.state.type,
      reminder: this.state.reminder
    }
    this.props.create(payload)
    this.toggleAddTimerDiv()
  }

  toggleAddTimerDiv () {
    this.setState({
      addTimer: !this.state.addTimer
    })
  }

  newTimer () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <label className='text-secondary'>Name</label>
            <input type='text' id='name' onChange={ev => this.setState({ name: ev.target.value })} />
          </div>
          <div className='col'>
            <label className='text-secondary'>Enable</label>
            <input type='checkbox' id='new-timer-enable' onClick={ev => this.setState({ enable: ev.target.checked })} />
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <Cron
              update={this.updateCron}
              disabled={false}
              id_prefix='new-timer'
              day={this.state.day}
              hour={this.state.hour}
              minute={this.state.minute}
              second={this.state.second}
            />
          </div>
          <div className='col'>
            <div className='btn-group'>
              <label className='btn btn-secondary'>
                <input type='radio' name='options' id='reminder' onClick={this.setType('reminder')} /> Reminder
              </label>
              <label className='btn btn-secondary'>
                <input type='radio' name='options' id='equipment' defaultChecked onClick={this.setType('equipment')} />
                Equipment
              </label>
            </div>
            {this.trigger()}
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <input
              id='createTimer'
              type='button'
              value='add'
              onClick={this.createTimer}
              className='btn btn-outline-primary float-right'
            />
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
          <input
            type='button'
            id='add_timer'
            value={this.state.addTimer ? '-' : '+'}
            onClick={this.toggleAddTimerDiv}
            className='btn btn-outline-success'
          />
          {nT}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    timers: state.timers,
    equipment: state.equipment
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchTimers()),
    fetchEquipment: () => dispatch(fetchEquipment()),
    create: t => dispatch(createTimer(t)),
    delete: id => dispatch(deleteTimer(id)),
    update: (id, t) => dispatch(updateTimer(id, t))
  }
}

const Timers = connect(
  mapStateToProps,
  mapDispatchToProps
)(Main)
export default Timers
