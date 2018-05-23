import React from 'react'
import $ from 'jquery'
import Equipment from './equipment.jsx'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {ajaxGet, ajaxPut, ajaxDelete} from '../utils/ajax.js'
import {showAlert, hideAlert} from '../utils/alert.js'
import {confirm} from '../utils/confirm.js'

export default class Equipments extends React.Component {
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
      var outlet ={}
      $.each(this.state.outlets, function(x, o){
        if(v.outlet== o.id){
          outlet = o
        }
      }.bind(this))
      list.push(
        <div key={k} className='row list-group-item'>
          <div className='col-sm-8'>
            <Equipment id={v.id} name={v.name} on={v.on} outlet={outlet} />
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
    ajaxGet({
      url: '/api/equipments',
      success: function (data) {
        this.setState({
          equipments: data,
        })
        hideAlert()
      }.bind(this)
    })
    ajaxGet({
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
    })
    hideAlert()
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
      showAlert('Select an outlet')
      return
    }
    var outletID = this.state.outlets[this.state.selectedOutlet].id
    var payload = {
      name: $('#equipmentName').val(),
      outlet: outletID
    }
    if (payload.name === '') {
      showAlert('Specify equipment name')
      return
    }
    hideAlert()
    ajaxPut({
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
      confirm('Are you sure ?')
      .then(function () {
        ajaxDelete({
          url: '/api/equipments/' + id,
          success: function (data) {
            this.fetchData()
            hideAlert()
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
