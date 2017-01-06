import React, { Component } from 'react'
import { DropdownButton, MenuItem, Table } from 'react-bootstrap'
import $ from 'jquery'

export default class Jobs extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      equipment: undefined,
      equipmentAction: 'on',
      equipmentValue: 0,
      equipments: [],
      outletType: undefined,
      jobs: [],
      addJob: false
    }
    this.jobList = this.jobList.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
    this.setEquipmentAction = this.setEquipmentAction.bind(this)
    this.setEquipmentValue = this.setEquipmentValue.bind(this)
    this.saveJob = this.saveJob.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.removeJob = this.removeJob.bind(this)
    this.toggleAddJobDiv = this.toggleAddJobDiv.bind(this)
    this.showValueSlider = this.showValueSlider.bind(this)
    this.setOutletType = this.setOutletType.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  fetchData () {
    $.ajax({
      url: '/api/jobs',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          jobs: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
    $.ajax({
      url: '/api/equipments',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          equipments: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  jobList () {
    var list = []
    $.each(this.state.jobs, function (k, v) {
      list.push(
        <li key={k} id={v.id} className='list-group-item row'>
          <div className='col-sm-7'> {v.name} </div>
          <div className='col-sm-1'><input type='button' onClick={this.removeJob} id={'job-' + v.id} value='delete' className='btn btn-outline-danger' /></div>
        </li>
        )
    }.bind(this))
    return list
  }

  equipmentList () {
    var menuItems = []
    $.each(this.state.equipments, function (k, v) {
      menuItems.push(<MenuItem key={k} eventKey={k}>{v.name}</MenuItem>)
    })
    return menuItems
  }

  removeJob (ev) {
    var jobID = ev.target.id.split('-')[1]
    $.ajax({
      url: '/api/jobs/' + jobID,
      type: 'DELETE',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  setEquipment (k, ev) {
    var eqID = this.state.equipments[k].id
    $.ajax({
      url: '/api/equipments/' + eqID,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          equipment: data
        })
        this.setOutletType(data.outlet)
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  setOutletType (i) {
    $.ajax({
      url: '/api/outlets/' + i,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          outletType: data.type
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  setEquipmentAction (k, ev) {
    this.setState({
      equipmentAction: k
    })
  }

  setEquipmentValue (e) {
    this.setState({
      equipmentValue: parseInt(e.target.value)
    })
  }

  saveJob () {
    var payload = {
      name: $('#name').val(),
      day: $('#day').val(),
      hour: $('#hour').val(),
      minute: $('#minute').val(),
      second: $('#second').val(),
      action: this.state.equipmentAction,
      value: this.state.equipmentValue,
      equipment: this.state.equipment.id
    }
    $.ajax({
      url: '/api/jobs',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddJobDiv()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  };

  toggleAddJobDiv () {
    this.setState({
      addJob: !this.state.addJob
    })
    $('#name').val('')
    $('#day').val('')
    $('#hour').val('')
    $('#minute').val('')
    $('#second').val('')
  }

  showValueSlider () {
    if (this.state.equipment == undefined) {
      return false
    }
    if ((this.state.outletType == 'pwm') &&
          (this.state.equipmentAction == 'on')) {
      return true
    }
    return false
  }

  render () {
    var sliderVisible = {
      display: this.showValueSlider() ? 'block' : 'none'
    }
    var eqName = ''
    if (this.state.equipment != undefined) {
      eqName = this.state.equipment.name
    }

    var dStyle = {
      display: this.state.addJob ? 'block' : 'none'
    }

    return (
      <div>
        <ul>{this.jobList()}</ul>
        <div className='container'>
          <input type='button' value={this.state.addJob ? '-' : '+'} onClick={this.toggleAddJobDiv} className='btn btn-outline-success' />
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
                <div className='row' style={sliderVisible}>
                  <input className='col-sm-4' type='range' onChange={this.setEquipmentValue} value={this.state.equipmentValue} />
                  <div className='col-sm-1'>
                    {this.state.equipmentValue}
                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='row'>
                  <label className='col-sm-3'>Day</label> <input type='text' id='day' className='col-sm-2' />
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
            <input type='button' value='add' onClick={this.saveJob} className='btn btn-outline-primary' />
          </div>
        </div>
      </div>
    )
  }
}
