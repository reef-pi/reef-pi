import Common from './common.jsx'
import $ from 'jquery'
import React from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class Doser extends Common {
  constructor (props) {
    super(props)
    this.state = {
      selectedEquipment: undefined,
      equipments: [],
      dosers: [],
      add: false
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.remove = this.remove.bind(this)
    this.fetch = this.fetch.bind(this)
    this.loadEquipments = this.loadEquipments.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
    this.doserList = this.doserList.bind(this)
  }

  componentWillMount () {
    this.fetch()
    this.loadEquipments()
  }

  doserList () {
    var dosers = []
    $.each(this.state.dosers, function (i, doser) {
      dosers.push(
        <div key={'doser-' + i} className='row'>
          <div className='col-sm-4'>{doser.Name}</div>
          <div className='col-sm-1'>
            <input type='button' id={'remove-doser-' + light.name} onClick={this.remove(doser.id)} value='delete' className='btn btn-outline-danger col-sm-2' />
          </div>
        </div>
      )
    }.bind(this))
    return (dosers)
  }

  fetch () {
    $.ajax({
      url: '/api/dosers',
      type: 'GET',
      success: function (data) {
        this.setState({
          dosers: data
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

  setEquipment (i, ev) {
    this.setState({
      selectedEquipment: i
    })
  }

  loadEquipments () {
    $.ajax({
      url: '/api/equipments',
      type: 'GET',
      success: function (data) {
        this.setState({
          equipments: data
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
    var equipments = []
    $.each(this.state.equipments, function (i, equipment) {
      equipments.push(<MenuItem key={i} eventKey={i}>{equipment.name}</MenuItem>)
    })
    return equipments
  }

  add () {
    if (this.state.selectedEquipment === undefined) {
      this.setState({
        showAlert: true,
        alertMsg: 'Select an equipment'
      })
      return
    }
    if ($('#doserName').val() === '') {
      this.setState({
        showAlert: true,
        alertMsg: 'Specify doser name'
      })
      return
    }
    var eq = this.state.equipments[this.state.selectedEquipment].id
    var payload = {
      name: $('#doserName').val(),
      equipment: String(eq)
    }
    $.ajax({
      url: '/api/dosers',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchLights()
        this.setState({
          add: !this.state.add
        })
        $('#doserName').val('')
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  remove () {
    return (function () {
      this.confirm('Are you sure ?')
      .then(function () {
        $.ajax({
          url: '/api/dosers/' + id,
          type: 'DELETE',
          success: function (data) {
            this.fetch()
          }.bind(this),
          error: function (xhr, status, err) {
            console.log(err.toString())
          }
        })
      }.bind(this))
    }.bind(this))
  }

  toggle () {
    this.setState({
      add: !this.state.addLight
    })
    $('#doserName').val('')
  }

  render () {
    var equipment = ''
    if (this.state.selectedEquipment !== undefined) {
      var e = this.state.equipments[this.state.selectedEquipment]
      equipment = e.name
    }
    var dStyle = {
      display: this.state.add ? 'block' : 'none'
    }
    return (
      <div className='container'>
        {super.render()}
        <div className='container'>
          { this.doserList() }
        </div>
      </div>
    )
  }
}
