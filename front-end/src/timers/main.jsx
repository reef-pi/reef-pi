import React from 'react'
import i18next from 'i18next'
import { confirm } from 'utils/confirm'
import { updateTimer, fetchTimers, createTimer, deleteTimer } from 'redux/actions/timer'
import { connect } from 'react-redux'
import TimerForm from './timer_form'
import Collapsible from '../ui_components/collapsible'
import CollapsibleList from '../ui_components/collapsible_list'
import { SortByName } from 'utils/sort_by_name'

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addTimer: false
    }
    this.timerList = this.timerList.bind(this)
    this.handleRemoveTimer = this.handleRemoveTimer.bind(this)
    this.handleUpdateTimer = this.handleUpdateTimer.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleToggleAddTimerDiv = this.handleToggleAddTimerDiv.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  timerList () {
    return this.props.timers.sort((a, b) => SortByName(a, b))
      .map(timer => {
        const handleToggleState = () => {
          timer.enable = !timer.enable
          this.props.update(timer.id, timer)
        }
        return (
          <Collapsible
            key={'panel-timer-' + timer.id}
            name={'panel-timer-' + timer.id}
            item={timer}
            onToggleState={handleToggleState}
            enabled={timer.enable}
            title={<b className='ml-2 align-middle'>{timer.name}</b>}
            onDelete={this.handleRemoveTimer}
          >
            <TimerForm
              readOnly={timer.readOnly}
              onSubmit={this.handleUpdateTimer}
              equipment={this.props.equipment}
              macros={this.props.macros}
              key={Number(timer.id)}
              timer={timer}
            />
          </Collapsible>
        )
      })
  }

  handleRemoveTimer (timer) {
    const message = (
      <div>
        <p>
          {i18next.t('timers:warn_delete').replace('$[name]', timer.name)}
        </p>
      </div>
    )

    confirm(i18next.t('delete'), { description: message }).then(
      function () {
        this.props.delete(timer.id)
      }.bind(this)
    )
  }

  valuesToTimer (values) {
    const target = values.target
    if (values.type === 'equipment') {
      target.duration = parseInt(target.duration)
    }
    const timer = {
      name: values.name,
      type: values.type,
      month: values.month,
      week: values.week,
      day: values.day,
      hour: values.hour,
      minute: values.minute,
      second: values.second,
      enable: values.enable,
      target: target
    }
    return timer
  }

  handleUpdateTimer (values) {
    const payload = this.valuesToTimer(values)
    this.props.update(values.id, payload)
  }

  handleSubmit (values) {
    const payload = this.valuesToTimer(values)
    this.props.create(payload)
    this.handleToggleAddTimerDiv()
  }

  handleToggleAddTimerDiv () {
    this.setState({
      addTimer: !this.state.addTimer
    })
  }

  render () {
    let nT = <div />
    if (this.state.addTimer) {
      nT = <TimerForm equipment={this.props.equipment} onSubmit={this.handleSubmit} macros={this.props.macros} />
    }
    return (
      <ul className='list-group list-group-flush'>
        <CollapsibleList>{this.timerList()}</CollapsibleList>
        <li className='list-group-item add-timer'>
          <div className='row'>
            <div className='col'>
              <input
                type='button'
                id='add_timer'
                value={this.state.addTimer ? '-' : '+'}
                onClick={this.handleToggleAddTimerDiv}
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
