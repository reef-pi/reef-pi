import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class SelectEquipment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      equipments: [],
      showAlert: false,
      alertMsg: '',
      equipment: {
        id: props.active,
        name: ''
      }
    }
    this.fetchData = this.fetchData.bind(this)
    this.showAlert = this.showAlert.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
  }

  componentDidMount () {
    this.fetchData()
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
      url: '/api/equipments',
      type: 'GET',
      dataType: 'json',
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
    var menuItems = []
    $.each(this.state.equipments, function (k, v) {
      var active = this.state.equipment.id === v.id
      menuItems.push(<MenuItem key={k} active={active} eventKey={k}>{v.name}</MenuItem>)
    }.bind(this))
    return menuItems
  }

  setEquipment (k, ev) {
    var eq = this.state.equipments[k]
    this.setState({
      equipment: eq
    })
    this.props.update(eq.id)
  }

  render () {
    var eqName = this.state.equipment.name
    return (
      <div className='container'>
        {this.showAlert()}
        <DropdownButton title={eqName} id='equipment' onSelect={this.setEquipment}>
          {this.equipmentList()}
        </DropdownButton>
      </div>
    )
  }
}
