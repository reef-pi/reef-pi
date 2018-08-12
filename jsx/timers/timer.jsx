import React from 'react'
import Equipment from './equipment'
import Reminder from './reminder'
import PropTypes from 'prop-types'
import Cron from './cron'

export default class Timer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      expand: false,
      name: props.name,
      equipment: props.equipment,
      reminder: props.reminder,
      day: props.day,
      minute: props.minute,
      hour: props.hour,
      second: props.second,
      enable: props.enable,
      type: props.type
    }
    this.t2s = this.t2s.bind(this)
    this.details = this.details.bind(this)
    this.update = this.update.bind(this)
    this.updateCron = this.updateCron.bind(this)
    this.set = this.set.bind(this)
    this.setType = this.setType.bind(this)
    this.trigger = this.trigger.bind(this)
  }

  setType (k) {
    return () => {
      this.setState({type: k})
    }
  }

  set (k) {
    return (d) => {
      var h = {}
      h[k] = d
      this.setState(h)
    }
  }

  trigger () {
    switch (this.state.type) {
      case 'equipment':
        return (
          <Equipment
            active_id={this.state.equipment.id}
            revert={this.state.equipment.revert}
            duration={this.state.equipment.duration}
            on={this.state.equipment.on}
            update={this.set('equipment')}
            equipments={this.props.equipments}
            disabled={!this.state.edit}
            id_prefix={'timer-' + this.props.timer_id}
          />
        )
      case 'reminder':
        return (
          <Reminder
            update={this.set('reminder')}
            disabled={!this.state.edit}
            id_prefix={'timer-' + this.props.timer_id}
            title={this.state.reminder.title}
            message={this.state.reminder.message}
          />)
    }
  }

  updateCron (p) {
    this.setState({
      day: p.day,
      minute: p.minute,
      hour: p.hour,
      second: p.second
    })
  }

  update () {
    if (!this.state.edit) {
      this.setState({edit: true})
      return
    }
    var equipment = {
      revert: this.state.equipment.revert,
      id: this.state.equipment.id,
      on: this.state.equipment.on,
      duration: parseInt(this.state.equipment.duration)
    }
    this.props.update({
      name: this.state.name,
      equipment: equipment,
      day: this.state.day,
      minute: this.state.minute,
      hour: this.state.hour,
      second: this.state.second,
      enable: this.state.enable,
      type: this.state.type,
      reminder: this.state.reminder
    })
    this.setState({edit: false})
  }

  t2s () {
    var trigger = ''
    switch (this.state.type) {
      case 'equipment':
        var eqAction = this.state.equipment.on ? 'on' : 'off'
        var eqName = ''
        this.props.equipments.forEach((eq) => {
          if (eq.id === this.props.active_id) {
            eqName = eq.name
          }
        })
        if (this.state.equipment.revert) {
          trigger = '(' + eqName + ' ' + eqAction + ' [' + this.state.equipment.duration + ']' + ')'
        } else {
          trigger = '(' + eqName + ' ' + eqAction + ')'
        }
        break
      case 'reminder':
        trigger = '(reminder)'
        break
    }

    var parts = [
      this.state.day + '  ',
      this.state.hour + ':',
      this.state.minute + ':',
      this.state.second + ' ',
      trigger
    ]
    return parts.join('')
  }

  details () {
    var lbl = 'edit'
    var cls = 'btn btn-outline-success float-right'
    if (this.state.edit) {
      lbl = 'save'
      cls = 'btn btn-outline-primary float-right'
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <label className='text-secondary'>Name</label>
            <input
              type='text'
              id={'time-name-' + this.props.timer_id}
              disabled={!this.state.edit}
              defaultValue={this.state.name}
              onChange={(ev) => this.setState({name: ev.target.value})}
            />
          </div>
          <div className='col'>
            <label className='text-secondary'>Enable</label>
            <input
              type='checkbox'
              defaultChecked={this.state.enable}
              id={'timer-enable-' + this.props.timer_id}
              disabled={!this.state.edit}
              onClick={(ev) => this.setState({enable: ev.target.checked})}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <Cron
              disabled={!this.state.edit}
              update={this.updateCron}
              id_prefix={'timer-' + this.props.timer_id}
              day={this.state.day}
              hour={this.state.hour}
              minute={this.state.minute}
              second={this.state.second}
            />
          </div>
          <div className='col'>
            <div className='btn-group'>
              <label className='btn btn-secondary'>
                <input
                  type='radio'
                  name={'time-type-' + this.props.timer_id}
                  id={'time-type-reminder-' + this.props.timer_id}
                  onClick={this.setType('reminder')}
                  disabled={!this.state.edit}
                  defaultChecked={this.state.type === 'reminder'}
                />
                Reminder
              </label>
              <label className='btn btn-secondary'>
                <input
                  disabled={!this.state.edit}
                  type='radio'
                  name={'time-type-' + this.props.timer_id}
                  id={'time-type-equipment-' + this.props.timer_id}
                  defaultChecked={this.state.type === 'equipment'}
                  onClick={this.setType('equipment')}
                />
                Equipment
              </label>
            </div>
            {this.trigger()}
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <input
              type='button'
              id={'update-timer-' + this.props.timer_id}
              value={lbl}
              onClick={this.update}
              className={cls}
            />
          </div>
        </div>
      </div>
    )
  }

  render () {
    var lbl = 'expand'
    var details = <div />
    if (this.state.expand) {
      lbl = 'collapse'
      details = this.details()
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <label className='text-primary'>
              {this.state.name}
            </label>
            <span className='small'> {this.t2s()} </span>
          </div>
          <div className='col'>
            <div className='float-right'>
              <input
                type='button'
                id={'expand-timer-' + this.props.timer_id}
                value={lbl}
                onClick={() => { this.setState({expand: !this.state.expand}) }}
                className='btn btn-outline-dark'
              />
              <input
                type='button'
                onClick={this.props.remove}
                id={'remove-timer-' + this.props.timer_id}
                value='delete'
                className='btn btn-outline-danger'
              />
            </div>
          </div>
        </div>
        <div className='row'>
          {details}
        </div>
      </div>
    )
  }
}

Timer.propTypes = {
  timer_id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  enable: PropTypes.bool.isRequired,
  equipment: PropTypes.object.isRequired,
  reminder: PropTypes.object.isRequired,
  day: PropTypes.string.isRequired,
  hour: PropTypes.string.isRequired,
  minute: PropTypes.string.isRequired,
  second: PropTypes.string.isRequired,

  remove: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  equipments: PropTypes.array.isRequired
}
