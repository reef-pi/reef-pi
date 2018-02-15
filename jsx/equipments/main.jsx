import React from 'react'
import $ from 'jquery'
import Equipment from './equipment.jsx'
import Common from '../common.jsx'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class Equipments extends Common {
  constructor (props) {
    super(props)
    this.state = {
      selectedOutlet: undefined,
      outlets: [],
      equipments: [],
      addEquipment: false
    }
    this.fetchData = this.fetchData.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.setOutlet = this.setOutlet.bind(this)
    this.outletList = this.outletList.bind(this)
    this.addEquipment = this.addEquipment.bind(this)
    this.removeEquipment = this.removeEquipment.bind(this)
    this.toggleAddEquipmentDiv = this.toggleAddEquipmentDiv.bind(this)
  }

  equipmentList () {
    var list = []
    var index = 0
    $.each(this.state.equipments, function (k, v) {
      list.push(
        <div key={k} className='row list-group-item'>
          <div className='col-sm-8'>
            <Equipment id={v.id} name={v.name} on={v.on} outlet={v.outlet} />
          </div>
          <div className='col-sm-4'>
            <input type='button' id={'equipment-' + index} onClick={this.removeEquipment(v.id)} value='delete' className='btn btn-outline-danger' />
          </div>
        </div>
       )
      index = index + 1
    }.bind(this))
    return list
  }

  fetchData () {
    this.ajaxGet({
      url: '/api/equipments',
      success: function (data) {
        this.setState({
          equipments: data,
          showAlert: false
        })
      }.bind(this)
    })
    this.ajaxGet({
      url: '/api/outlets',
      success: function (data) {
        this.setState({
          outlets: data
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
      menuItems.push(<MenuItem key={i} eventKey={i}><span id={'outlet-'.concat(v.id)}>{v.name}</span></MenuItem>)
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
    this.ajaxPut({
      url: '/api/equipments',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddEquipmentDiv()
        this.setState({
          selectedOutlet: undefined
        })
      }.bind(this)
    })
  }

  removeEquipment (id) {
    return (function () {
      this.confirm('Are you sure ?')
      .then(function () {
        this.ajaxDelete({
          url: '/api/equipments/' + id,
          success: function (data) {
            this.fetchData()
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
        {super.render()}
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
