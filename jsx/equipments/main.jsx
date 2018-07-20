import React from 'react'
import $ from 'jquery'
import Equipment from './equipment'
import {showAlert} from 'utils/alert'
import {confirm} from 'utils/confirm'
import {updateEquipment, fetchEquipments, createEquipment, deleteEquipment} from 'redux/actions/equipment'
import {fetchOutlets} from 'redux/actions/outlets'
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
    this.newEquipment = this.newEquipment.bind(this)
  }

  equipmentList () {
    var list = []
    var index = 0
    var noPadding = {
      padding: '0 !important',
      margin: '0 !important',
      marginLeft: '0px',
      marginRight: '0px',
      paddingLeft: '0px',
      paddingRight: '0px'
    }
    $.each(this.props.equipments, function (k, v) {
      var outlet = {}
      $.each(this.props.outlets, function (x, o) {
        if (v.outlet === o.id) {
          outlet = o
        }
      })
      list.push(
        <div key={k} className='list-group-item' style={noPadding}>
          <div key={k} className='row'>
            <div className='col-lg-10 col-xs-10'>
              <Equipment id={v.id} name={v.name} on={v.on} outlet={outlet} hook={this.props.updateEquipment} />
            </div>
            <div className='col-lg-2 col-xs-2'>
              <input type='button' id={'equipment-' + index} onClick={this.removeEquipment(v.id)} value='delete' className='btn btn-outline-danger' />
            </div>
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

  setOutlet (i) {
    return ev => {
      this.setState({
        selectedOutlet: i
      })
    }
  }

  outletList () {
    var items = []
    $.each(this.props.outlets, function (i, v) {
      items.push(<a className='dropdown-item' href='#' onClick={this.setOutlet(i)} key={'outlet-' + i}>
        <span id={'outlet-'.concat(v.id)}>{v.name}</span>
      </a>)
    }.bind(this))
    return items
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

  newEquipment () {
    var outlet = ''
    if (this.state.selectedOutlet !== undefined) {
      outlet = this.props.outlets[this.state.selectedOutlet].name
    }
    return (
      <div className='row'>
        <div className='col-lg-1'>Name</div>
        <div className='col-lg-2'><input type='text' id='equipmentName' /></div>
        <div className='col-lg-1' />
        <div className='col-lg-1'>Outlet</div>
        <div className='col-lg-2'>
          <div className='dropdown'>
            <button className='btn btn-secondary dropdown-toggle' type='button' id='outlet' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
              {outlet}
            </button>
            <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
              {this.outletList()}
            </div>
          </div>
        </div>
        <div clssName='col-lg-1'>
          <input type='button' id='createEquipment' value='add' onClick={this.addEquipment} className='btn btn-outline-primary' />
        </div>
      </div>
    )
  }

  render () {
    var nEq = <div />
    if (this.state.addEquipment) {
      nEq = this.newEquipment()
    }
    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>
          {this.equipmentList()}
        </ul>
        <div className='row'>
          <input id='add_equipment' type='button' value={this.state.addEquipment ? '-' : '+'} onClick={this.toggleAddEquipmentDiv} className='btn btn-outline-success' />
        </div>
        {nEq}
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
