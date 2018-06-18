import React from 'react'
import $ from 'jquery'
import Equipment from './equipment.jsx'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {showAlert, hideAlert} from '../utils/alert.js'
import {confirm} from '../utils/confirm.js'
import {updateEquipment, fetchEquipments, createEquipment, deleteEquipment} from '../redux/actions/equipment'
import {fetchOutlets} from '../redux/actions/outlets'
import {connect} from 'react-redux'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedOutlet: undefined,
      addEquipment: false
    }
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
    $.each(this.props.equipments, function (k, v) {
      var outlet = {}
      $.each(this.props.outlets, function (x, o) {
        if (v.outlet == o.id) {
          outlet = o
        }
      })
      list.push(
        <div key={k} className='row list-group-item'>
          <div className='col-sm-8'>
            <Equipment id={v.id} name={v.name} on={v.on} outlet={outlet} hook={this.props.updateEquipment} />
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

  componentDidMount () {
    this.props.fetchEquipments()
    this.props.fetchOutlets()
  }

  setOutlet (i, ev) {
    this.setState({
      selectedOutlet: i
    })
    hideAlert()
  }

  outletList () {
    var menuItems = []
    $.each(this.props.outlets, function (i, v) {
      menuItems.push(<MenuItem key={i} eventKey={i}><span id={'outlet-'.concat(v.id)}>{v.name}</span></MenuItem>)
    })
    return menuItems
  }

  addEquipment () {
    if (this.state.selectedOutlet === undefined) {
      showAlert('Select an outlet')
      return
    }
    var outletID = this.props.outlets[this.state.selectedOutlet].id
    var payload = {
      name: $('#equipmentName').val(),
      outlet: outletID
    }
    if (payload.name === '') {
      showAlert('Specify equipment name')
      return
    }
    hideAlert()
    this.props.createEquipment(payload)
    this.toggleAddEquipmentDiv()
    this.setState({
      selectedOutlet: undefined
    })
  }

  removeEquipment (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.deleteEquipment(id)
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
      outlet = this.props.outlets[this.state.selectedOutlet].name
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
const mapStateToProps = (state) => {
  return {
    equipments: state.equipments,
    outlets: state.outlets
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchEquipments: () => dispatch(fetchEquipments()),
    fetchOutlets: () => dispatch(fetchOutlets()),
    createEquipment: (e) => dispatch(createEquipment(e)),
    updateEquipment: (id, e) => dispatch(updateEquipment(id, e)),
    deleteEquipment: (id) => dispatch(deleteEquipment(id))
  }
}

const Main = connect(mapStateToProps, mapDispatchToProps)(main)
export default Main
