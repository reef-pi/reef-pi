import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import Common from './common.jsx'

export default class SelectEquipment extends Common {
  constructor (props) {
    super(props)
    this.state = {
      equipments: [],
      equipment: {
        id: props.active,
        name: ''
      }
    }
    this.fetchData = this.fetchData.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  fetchData () {
    this.ajaxGet({
      url: '/api/equipments',
      success: function (data) {
        var equipment = this.state.equipment
        $.each(data, function (i, eq) {
          if (eq.id === equipment.id) {
            equipment = eq
          }
        })
        this.setState({
          equipments: data,
          equipment: equipment,
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

  equipmentList () {
    var menuItems = [ <MenuItem key='none' active={this.state.equipment === undefined} eventKey='none'>-</MenuItem> ]
    $.each(this.state.equipments, function (k, v) {
      var active = false
      if (this.state.equipment !== undefined) {
        active = this.state.equipment.id === v.id
      }
      menuItems.push(<MenuItem key={k} active={active} eventKey={k}>{v.name}</MenuItem>)
    }.bind(this))
    return menuItems
  }

  setEquipment (k, ev) {
    if (k === 'none') {
      this.setState({
        equipment: undefined
      })
      this.props.update('')
      return
    }
    var eq = this.state.equipments[k]
    this.setState({
      equipment: eq
    })
    this.props.update(eq.id)
  }

  render () {
    var eqName = ''
    if (this.state.equipment !== undefined) {
      eqName = this.state.equipment.name
    }
    return (
      <div className='container'>
        {super.render()}
        <DropdownButton title={eqName} id='equipment' onSelect={this.setEquipment}>
          {this.equipmentList()}
        </DropdownButton>
      </div>
    )
  }
}
