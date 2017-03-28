import React from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import $ from 'jquery'
import Equipment from './equipment.jsx'

export default class Equipments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedOutlet: undefined,
      outlets: [],
      equipments: [],
      addEquipment: false
    }
    this.setOutlet = this.setOutlet.bind(this)
    this.outletList = this.outletList.bind(this)
    this.addEquipment = this.addEquipment.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.toggleAddEquipmentDiv = this.toggleAddEquipmentDiv.bind(this)
  }

  equipmentList () {
    var list = []
    $.each(this.state.equipments, function (k, v) {
      list.push(
        <li key={k} className='list-group-item'>
          <Equipment id={v.id} name={v.name} on={v.on} updateHook={this.fetchData} />
        </li>
            )
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
          equipments: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
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
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  setOutlet (i, ev) {
    this.setState({
      selectedOutlet: i
    })
  }

  outletList () {
    var menuItems = []
    $.each(this.state.outlets, function (i, v) {
      if (v.equipment === '') {
        menuItems.push(<MenuItem key={i} eventKey={i}>{v.name}</MenuItem>)
      }
    })
    return menuItems
  }

  addEquipment () {
    var outletName = this.state.outlets[this.state.selectedOutlet].name
    var payload = {
      name: $('#equipmentName').val(),
      outlet: String(outletName)
    }
    $.ajax({
      url: '/api/equipments',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddEquipmentDiv()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  toggleAddEquipmentDiv () {
    this.setState({
      addEquipment: !this.state.addEquipment
    })
    $('#outlet-name').val('')
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
      <div>
        <ul className='list-group'>
          {this.equipmentList()}
        </ul>
        <div>
          <input type='button' value={this.state.addEquipment ? '-' : '+'} onClick={this.toggleAddEquipmentDiv} className='btn btn-outline-success' />
          <div style={dStyle}>
               Name: <input type='text' id='equipmentName' />
               Outlet:
               <DropdownButton
                 title={outlet}
                 id='outlet'
                 onSelect={this.setOutlet}>
                 {this.outletList()}
               </DropdownButton>
            <input type='button' value='add' onClick={this.addEquipment} className='btn btn-outline-primary' />
          </div>
        </div>
      </div>
    )
  }
}
