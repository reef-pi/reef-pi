import React from 'react'
import { confirm } from 'utils/confirm'
import { updateTimer, fetchTimers, createTimer, deleteTimer } from 'redux/actions/timer'
import { connect } from 'react-redux'
import TimerForm from './timer_form'
import Collapsible from '../ui_components/collapsible'
import CollapsibleList from '../ui_components/collapsible_list'

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addTimer: false
    }
    this.timerList = this.timerList.bind(this)
    this.removeTimer = this.removeTimer.bind(this)
    this.updateTimer = this.updateTimer.bind(this)
    this.createTimer = this.createTimer.bind(this)
    this.toggleAddTimerDiv = this.toggleAddTimerDiv.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  timerList () {
    return (
      this.props.timers.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).map(timer => {
        let tState = () => {
          timer.enable = !timer.enable
          this.props.update(timer.id, timer)
        }
        return (
          <Collapsible key={'panel-timer-' + timer.id}
            name={'panel-timer-' + timer.id}
            item={timer}
            onToggleState={tState}
            enabled={timer.enable}
            title={<b className='ml-2 align-middle'>{timer.name}</b>}
            onDelete={this.removeTimer}>
            <TimerForm readOnly={timer.readOnly}
              onSubmit={this.updateTimer}
              equipment={this.props.equipment}
              macros={this.props.macros}
              key={Number(timer.id)}
              timer={timer} />
          </Collapsible>
        )
      })
    )
  }

  removeTimer (timer) {
    const message = (
      <div>
        <p>This action will delete {timer.name}.</p>
      </div>
    )

    confirm('Delete ' + timer.name, {description: message})
      .then(function () {
        this.props.delete(timer.id)
      }.bind(this))
  }

  valuesToTimer (values) {
    var timer = {
      name: values.name,
      day: values.day,
      hour: values.hour,
      minute: values.minute,
      second: values.second,
      enable: values.enable,
      equipment: {
        id: values.equipment_id,
        revert: values.revert,
        duration: parseInt(values.duration),
        on: values.on
      },
      type: values.type,
      reminder: {
        title: values.title,
        message: values.message
      }
    }
    return timer
  }

  updateTimer (values) {
    var payload = this.valuesToTimer(values)

    this.props.update(values.id, payload)
  }

  createTimer (values) {
    var payload = this.valuesToTimer(values)

    this.props.create(payload)
    this.toggleAddTimerDiv()
  }

  toggleAddTimerDiv () {
    this.setState({
      addTimer: !this.state.addTimer
    })
  }

  render () {
    var nT = <div />
    if (this.state.addTimer) {
      nT = <TimerForm
        equipment={this.props.equipment}
        onSubmit={this.createTimer}
        macros={this.props.macros}
      />
    }
    return (
      <ul className='list-group list-group-flush'>
        <CollapsibleList>
          {this.timerList()}
        </CollapsibleList>
        <li className='list-group-item add-timer'>
          <div className='row'>
            <div className='col'>
              <input
                type='button'
                id='add_timer'
                value={this.state.addTimer ? '-' : '+'}
                onClick={this.toggleAddTimerDiv}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {nT}
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    timers: state.timers,
    equipment: state.equipment,
    macros: state.macros
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchTimers()),
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
