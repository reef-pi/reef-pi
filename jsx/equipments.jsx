import React from 'react'
import $ from 'jquery'
import Equipment from './equipment.jsx'
import ReactDOM from 'react-dom'
import Confirm from './confirm.jsx'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class Equipments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedOutlet: undefined,
      outlets: [],
      equipments: [],
      addEquipment: false,
      showAlert: false,
      alertMsg: ''
    }
    this.confirm = this.confirm.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.setOutlet = this.setOutlet.bind(this)
    this.outletList = this.outletList.bind(this)
    this.addEquipment = this.addEquipment.bind(this)
    this.removeEquipment = this.removeEquipment.bind(this)
    this.toggleAddEquipmentDiv = this.toggleAddEquipmentDiv.bind(this)
    this.showAlert = this.showAlert.bind(this)
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

  equipmentList () {
    var list = []
    var index = 0
    $.each(this.state.equipments, function (k, v) {
      list.push(
        <li key={k} className='list-group-item'>
          <div className='row'>
            <div className='col-sm-8'>
              <Equipment id={v.id} name={v.name} on={v.on} outlet={v.outlet} />
            </div>
            <div className='col-sm-4'>
              <input type='button' id={'equipment-' + index} onClick={this.removeEquipment(v.id)} value='delete' className='btn btn-outline-danger' />
            </div>
          </div>
        </li>
       )
      index = index + 1
    }.bind(this))
    return list
  }

  fetchData () {
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
    $.ajax({
      url: '/api/outlets',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          outlets: data
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

  componentDidMount () {
    this.fetchData()
  }
  setOutlet (i, ev) {
    this.setState({
      selectedOutlet: i,
      showAlert: false
    })
  }

  outletList () {
    var menuItems = []
    $.each(this.state.outlets, function (i, v) {
      menuItems.push(<MenuItem key={i} eventKey={i}>{v.name}</MenuItem>)
    })
    return menuItems
  }

  addEquipment () {
    if (this.state.selectedOutlet === undefined) {
      this.setState({
        showAlert: true,
        alertMsg: 'Select an outlet'
      })
      return
    }
    var outletID = this.state.outlets[this.state.selectedOutlet].id
    var payload = {
      name: $('#equipmentName').val(),
      outlet: outletID
    }
    if (payload.name === '') {
      this.setState({
        showAlert: true,
        alertMsg: 'Specify equipment name'
      })
      return
    }
    this.setState({
      showAlert: false
    })
    $.ajax({
      url: '/api/equipments',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddEquipmentDiv()
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  removeEquipment (id) {
    return (function () {
      this.confirm('Are you sure ?')
      .then(function () {
        $.ajax({
          url: '/api/equipments/' + id,
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

  toggleAddEquipmentDiv () {
    this.setState({
      addEquipment: !this.state.addEquipment
    })
    $('#outlet-name').val('')
    $('#equipmentName').val('')
  }

  render () {
    var outlet = ''
    if (this.state.selectedOutlet !== undefined) {
      outlet = this.state.outlets[this.state.selectedOutlet].name
    }
    var dStyle = {
      display: this.state.addEquipment ? 'block' : 'none'
    }
    return (
      <div className='container'>
        {this.showAlert()}
        <ul className='list-group'>
          {this.equipmentList()}
        </ul>
        <div>
          <input id='add_equipment' type='button' value={this.state.addEquipment ? '-' : '+'} onClick={this.toggleAddEquipmentDiv} className='btn btn-outline-success' />
          <div style={dStyle}>
               Name: <input type='text' id='equipmentName' />
               Outlet:
               <DropdownButton
                 title={outlet}
                 id='outlet'
                 onSelect={this.setOutlet}>
                 {this.outletList()}
               </DropdownButton>
            <input type='button' id='createEquipment' value='add' onClick={this.addEquipment} className='btn btn-outline-primary' />
          </div>
        </div>
      </div>
    )
  }
}
