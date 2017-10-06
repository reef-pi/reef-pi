import React from 'react'
import { OverlayTrigger, DropdownButton, MenuItem, Tooltip } from 'react-bootstrap'
import $ from 'jquery'
import Timer from './timer.jsx'
import ReactDOM from 'react-dom'
import Confirm from './confirm.jsx'

export default class Timers extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      equipment: undefined,
      equipmentAction: 'on',
      equipments: [],
      timers: [],
      addTimer: false,
      showAlert: false,
      alertMsg: ''
    }
    this.timerList = this.timerList.bind(this)
    this.confirm = this.confirm.bind(this)
    this.createTimer = this.createTimer.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.removeTimer = this.removeTimer.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
    this.setEquipmentAction = this.setEquipmentAction.bind(this)
    this.toggleAddTimerDiv = this.toggleAddTimerDiv.bind(this)
    this.showAlert = this.showAlert.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  confirm (message, options) {
    var cleanup, component, props, wrapper
    if (options == null) {
      options = {}
    }
    props = $.extend({
      message: message
    }, options)
    wrapper = document.body.appendChild(document.createElement('div'))
    component = ReactDOM.render(<Confirm {...props} />, wrapper)
    cleanup = function () {
      ReactDOM.unmountComponentAtNode(wrapper)
      return setTimeout(function () {
        return wrapper.remove()
      })
    }
    return component.promise.always(cleanup).promise()
  }

  showAlert () {
    if (!this.state.showAlert) {
      return
    }
    return (
      <div className='alert alert-danger'>
        {this.state.alertMsg}
      </div>
    )
  }

  fetchData () {
    $.ajax({
      url: '/api/timers',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          timers: data,
          showAlert: false
        })
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
    $.ajax({
      url: '/api/equipments',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          equipments: data,
          showAlert: false
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

  timerList () {
    var list = []
    $.each(this.state.timers, function (i, timer) {
      list.push(
        <li key={timer.name} className='list-group-item row'>
          {}
          <Timer timer_id={timer.id} name={timer.name} equipment={timer.equipment} />
          <input type='button' onClick={this.removeTimer(timer.id)} id={'timer-' + timer.name} value='delete' className='btn btn-outline-danger' />
        </li>
        )
    }.bind(this))
    return (list)
  }

  equipmentList () {
    var menuItems = []
    $.each(this.state.equipments, function (k, v) {
      menuItems.push(<MenuItem key={k} eventKey={k}>{v.name}</MenuItem>)
    })
    return menuItems
  }

  removeTimer (id) {
    return (function () {
      this.confirm('Are you sure ?')
      .then(function () {
        $.ajax({
          url: '/api/timers/' + id,
          type: 'DELETE',
          success: function (data) {
            this.fetchData()
          }.bind(this),
          error: function (xhr, status, err) {
            this.setState({
              showAlert: true,
              alertMsg: xhr.responseText
            })
          }.bind(this)
        })
      }.bind(this))
    }.bind(this))
  }

  setEquipment (k, ev) {
    var eqID = this.state.equipments[k].id
    $.ajax({
      url: '/api/equipments/' + eqID,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          equipment: data,
          showAlert: false
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

  setEquipmentAction (k, ev) {
    this.setState({
      equipmentAction: k
    })
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
    if (this.state.equipment === undefined) {
      this.setState({
        alertMsg: 'Select an equipment',
        showAlert: true
      })
      return
    }
    var payload = {
      name: $('#name').val(),
      day: $('#day').val(),
      hour: $('#hour').val(),
      minute: $('#minute').val(),
      second: $('#second').val(),
      on: (this.state.equipmentAction === 'on'),
      equipment: this.state.equipment.id
    }
    $.ajax({
      url: '/api/timers',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddTimerDiv()
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
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
    var eqName = ''
    if (this.state.equipment !== undefined) {
      eqName = this.state.equipment.name
    }

    var dStyle = {
      display: this.state.addTimer ? 'block' : 'none'
    }
    var tooltip = (<Tooltip id='day-tooltip'> Any integer with 1 to 31, representing the day of the month or other valid specification</Tooltip>)
    var instance = <OverlayTrigger overlay={tooltip}>
      <label> ? </label>
    </OverlayTrigger>
    return (
      <div className='container'>
        {this.showAlert()}
        <ul>{this.timerList()}</ul>
        <div className='container'>
          <input type='button' id='add_timer' value={this.state.addTimer ? '-' : '+'} onClick={this.toggleAddTimerDiv} className='btn btn-outline-success' />
          <div style={dStyle} className='container'>
            <div className='row'>
              <div className='col-sm-6'>
                <div className='row'>
                  <div className='col-sm-3'>Name</div> <input type='text' id='name' className='col-sm-6' />
                </div>
                <div className='row'>
                  <div className='col-sm-6'>Equipment</div>
                  <div className='col-sm-6'>
                    <DropdownButton title={eqName} id='equipment' onSelect={this.setEquipment}>
                      {this.equipmentList()}
                    </DropdownButton>
                  </div>
                </div>
                <div className='row'>
                  <label className='col-sm-6 '> Action</label>
                  <span className='col-sm-6'>
                    <DropdownButton title={this.state.equipmentAction} id='equipmentAction' onSelect={this.setEquipmentAction}>
                      <MenuItem key='on' eventKey='on'> On </MenuItem>
                      <MenuItem key='off' eventKey='off'> Off </MenuItem>
                    </DropdownButton>
                  </span>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='row'>
                  <label className='col-sm-3'>Day of month</label>
                  <input type='text' id='day' className='col-sm-2' />
                  <label className='col-sm-1'>{instance}</label>
                </div>
                <div className='row'>
                  <label className='col-sm-3'>Hour</label> <input type='text' id='hour' className='col-sm-2' />
                </div>
                <div className='row'>
                  <label className='col-sm-3'>Minute</label> <input type='text' id='minute' className='col-sm-2' />
                </div>
                <div className='row'>
                  <label className='col-sm-3'>Second</label> <input type='text' id='second' className='col-sm-2' />
                </div>
              </div>
            </div>
            <input id='createTimer' type='button' value='add' onClick={this.createTimer} className='btn btn-outline-primary' />
          </div>
        </div>
      </div>
    )
  }
}
